// ==============================================================================
// ClauseGuard: Counter-Proposal & Negotiation API Route (/api/negotiate)
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { defaultRateLimiter } from '@/lib/security';
import { getLegalAiProvider } from '@/lib/ai/factory';
import { CounterProposal } from '@/lib/types';
import { mapErrorToResponse } from '@/lib/apiError';
import { negotiationCache, hashPayload } from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'anonymous-client';

    const rateLimit = await defaultRateLimiter.check(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a moment before requesting another counter-proposal.',
          retryAfter: rateLimit.resetSeconds,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.resetSeconds) },
        }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.clauseTitle || !body.originalClause) {
      return NextResponse.json(
        { error: 'Missing required parameters: clauseTitle and originalClause.' },
        { status: 400 }
      );
    }

    const cacheKey = hashPayload(`${body.clauseTitle}::${body.originalClause}::${body.potentialRisk || ''}`);
    const cachedProposal = negotiationCache.get(cacheKey);
    if (cachedProposal) {
      const cacheLatency = Date.now() - startTime;
      return NextResponse.json(
        {
          ...cachedProposal,
          metadata: { ...cachedProposal.metadata, latencyMs: cacheLatency, cached: true },
        },
        {
          status: 200,
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': 'no-store, max-age=0',
            'Server-Timing': `ai;dur=${cacheLatency};desc="cache-hit"`,
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          },
        }
      );
    }

    const provider = getLegalAiProvider();
    const rawProposal = await provider.draftCounterProposal(
      String(body.clauseTitle).slice(0, 200),
      String(body.originalClause).slice(0, 3000),
      String(body.potentialRisk || '').slice(0, 1000)
    );

    const latencyMs = Date.now() - startTime;

    const responseData: CounterProposal = {
      clauseId: body.clauseId || 'counter-1',
      clauseTitle: rawProposal.clauseTitle || body.clauseTitle,
      originalClause: rawProposal.originalClause || body.originalClause,
      revisedFairClause: rawProposal.revisedFairClause,
      rationale: rawProposal.rationale,
      readyToSendDraft: rawProposal.readyToSendDraft,
      metadata: {
        engineName: provider.engineName,
        isDemo: provider.isDemo,
        latencyMs,
      },
    };

    negotiationCache.set(cacheKey, responseData);

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'no-store, max-age=0',
        'Server-Timing': `ai;dur=${latencyMs}`,
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      },
    });
  } catch (error: unknown) {
    console.error('Error in /api/negotiate:', error);
    const { message, statusCode } = mapErrorToResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
