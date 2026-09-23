// ==============================================================================
// ClauseGuard: Grounded Legal Q&A Chat API Route (/api/chat)
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { defaultRateLimiter, sanitizeLegalText } from '@/lib/security';
import { getLegalAiProvider } from '@/lib/ai/factory';
import { IndexedDocumentVerifier } from '@/lib/groundingVerifier';
import { GroundedCitation } from '@/lib/types';
import { mapErrorToResponse } from '@/lib/apiError';
import { chatCache, hashPayload } from '@/lib/cache';
import { ChatRequestSchema } from '@/lib/validators';

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
          error: 'Rate limit exceeded. Please wait a moment before asking another question.',
          retryAfter: rateLimit.resetSeconds,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.resetSeconds) },
        }
      );
    }

    const rawBody = await req.json().catch(() => null);
    const parsed = ChatRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Missing or invalid fields: "contractText" and "question".' },
        { status: 400 }
      );
    }
    const body = parsed.data;

    const validation = sanitizeLegalText(body.contractText);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid contract text.' },
        { status: 400 }
      );
    }

    const question = body.question.trim();

    const cacheKey = hashPayload(`${validation.sanitized}::${question}`);
    const cachedChat = chatCache.get(cacheKey);
    if (cachedChat) {
      const cacheLatency = Date.now() - startTime;
      return NextResponse.json(
        { ...cachedChat, timestamp: new Date().toISOString(), cached: true },
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
    const rawAnswer = await provider.answerQuestion(validation.sanitized, question);

    // Deterministic anti-hallucination verification of cited quotes
    const verifier = new IndexedDocumentVerifier(validation.sanitized);
    const citations: GroundedCitation[] = (rawAnswer.citedQuotes || []).map((quote) =>
      verifier.verify(quote)
    );

    const latencyMs = Date.now() - startTime;

    const chatResponse = {
      answer: rawAnswer.answer,
      citations,
      engineName: provider.engineName,
      isDemo: provider.isDemo,
      timestamp: new Date().toISOString(),
    };

    chatCache.set(cacheKey, chatResponse);

    return NextResponse.json(chatResponse, {
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
    console.error('Error in /api/chat:', error);
    const { message, statusCode } = mapErrorToResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
