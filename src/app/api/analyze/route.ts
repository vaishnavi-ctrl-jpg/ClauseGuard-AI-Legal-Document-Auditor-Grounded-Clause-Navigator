// ==============================================================================
// ClauseGuard: Document Analysis API Route (/api/analyze)
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { defaultRateLimiter, sanitizeLegalText } from '@/lib/security';
import { getLegalAiProvider } from '@/lib/ai/factory';
import { IndexedDocumentVerifier } from '@/lib/groundingVerifier';
import { ClauseItem, DocumentAnalysis } from '@/lib/types';
import { mapErrorToResponse } from '@/lib/apiError';
import { documentAnalysisCache, hashPayload } from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. IP / Client Throttling
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'anonymous-client';

    const rateLimit = await defaultRateLimiter.check(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a moment before analyzing another document.',
          retryAfter: rateLimit.resetSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.resetSeconds),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // 2. Body Payload Parsing & Validation
    const body = await req.json().catch(() => null);
    if (!body || !body.contractText) {
      return NextResponse.json(
        { error: 'Missing required field "contractText" in request body.' },
        { status: 400 }
      );
    }

    // 3. Security Sanitization & Injection Defense
    const validation = sanitizeLegalText(body.contractText);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid contract text format.' },
        { status: 400 }
      );
    }

    const sanitizedText = validation.sanitized;
    const wordCount = sanitizedText.split(/\s+/).filter(Boolean).length;
    const cacheKey = hashPayload(sanitizedText);

    // 4. Instant O(1) Cache Hit Evaluation
    const cachedData = documentAnalysisCache.get(cacheKey);
    if (cachedData) {
      const cacheLatency = Date.now() - startTime;
      return NextResponse.json(
        {
          ...cachedData,
          metadata: {
            ...cachedData.metadata,
            latencyMs: cacheLatency,
            cached: true,
          },
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

    // 5. Execution via Injected Legal AI Provider
    const provider = getLegalAiProvider();
    const rawAnalysis = await provider.analyzeDocument(sanitizedText);

    // 5. Deterministic Grounding & Verification (Anti-Hallucination Pipeline)
    // Pre-indexes document lines once to ensure high performance
    const verifier = new IndexedDocumentVerifier(sanitizedText);

    const verifiedClauses: ClauseItem[] = rawAnalysis.clauses.map((clause, idx) => {
      const citation = verifier.verify(clause.legaleseSnippet);
      return {
        id: clause.id || `clause-${idx + 1}`,
        title: clause.title,
        riskLevel: clause.riskLevel,
        category: clause.category,
        legaleseSnippet: clause.legaleseSnippet,
        plainEnglishExplanation: clause.plainEnglishExplanation,
        potentialRisk: clause.potentialRisk,
        suggestedAction: clause.suggestedAction,
        citation,
      };
    });

    const latencyMs = Date.now() - startTime;

    // 6. Formulate Structured Response
    const responseData: DocumentAnalysis = {
      documentTitle: rawAnalysis.documentTitle || 'Audited Contract',
      overallRiskScore: Math.min(100, Math.max(0, rawAnalysis.overallRiskScore)),
      riskTier: rawAnalysis.riskTier || (rawAnalysis.overallRiskScore >= 70 ? 'CRITICAL' : rawAnalysis.overallRiskScore >= 40 ? 'CAUTION' : 'FAIR'),
      summary: rawAnalysis.summary,
      riskBreakdown: rawAnalysis.riskBreakdown || {
        liabilityScore: 50,
        financialScore: 50,
        exitDifficultyScore: 50,
        privacyScore: 50,
      },
      clauses: verifiedClauses,
      checklist: rawAnalysis.checklist || [],
      metadata: {
        engineName: provider.engineName,
        isDemo: provider.isDemo,
        latencyMs,
        wordCount,
        analyzedAt: new Date().toISOString(),
      },
    };

    // Populate O(1) response cache for subsequent identical requests
    documentAnalysisCache.set(cacheKey, responseData);

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
    console.error('Error in /api/analyze:', error);
    const { message, statusCode } = mapErrorToResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
