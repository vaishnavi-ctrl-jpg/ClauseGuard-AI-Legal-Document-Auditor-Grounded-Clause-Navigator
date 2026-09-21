// ==============================================================================
// ClauseGuard: Grounded Legal Q&A Chat API Route (/api/chat)
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { defaultRateLimiter, sanitizeLegalText } from '@/lib/security';
import { getLegalAiProvider } from '@/lib/ai/factory';
import { IndexedDocumentVerifier } from '@/lib/groundingVerifier';
import { GroundedCitation } from '@/lib/types';
import { mapErrorToResponse } from '@/lib/apiError';

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

    const body = await req.json().catch(() => null);
    if (!body || !body.contractText || !body.question) {
      return NextResponse.json(
        { error: 'Missing required fields: "contractText" and "question".' },
        { status: 400 }
      );
    }

    const validation = sanitizeLegalText(body.contractText);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid contract text.' },
        { status: 400 }
      );
    }

    const question = String(body.question).trim().slice(0, 500);
    if (question.length < 3) {
      return NextResponse.json(
        { error: 'Question is too short.' },
        { status: 400 }
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

    return NextResponse.json(
      {
        answer: rawAnswer.answer,
        citations,
        engineName: provider.engineName,
        isDemo: provider.isDemo,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Server-Timing': `ai;dur=${latencyMs}`,
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    );
  } catch (error: unknown) {
    console.error('Error in /api/chat:', error);
    const { message, statusCode } = mapErrorToResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
