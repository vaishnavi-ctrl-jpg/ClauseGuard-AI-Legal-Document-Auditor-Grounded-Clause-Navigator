// ==============================================================================
// ClauseGuard Integration Tests: API Endpoints (/api/analyze, /api/negotiate, /api/chat)
// ==============================================================================

import { describe, it, expect } from 'vitest';
import { POST as analyzeHandler } from '@/app/api/analyze/route';
import { POST as negotiateHandler } from '@/app/api/negotiate/route';
import { POST as chatHandler } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';

describe('API Route: /api/analyze', () => {
  it('returns 400 when body has missing contractText', async () => {
    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await analyzeHandler(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it('successfully analyzes a contract and returns verified citation metadata', async () => {
    const contractText = `
RESIDENTIAL LEASE AGREEMENT
Landlord reserves the right to enter the leased premises at any time without prior written notice for inspections.
In the event of early termination for any reason whatsoever, the entire security deposit shall be automatically forfeited as liquidated damages.
Tenant shall be solely responsible for all maintenance, repairs, and seasonal servicing of the central heating, ventilation, and air conditioning (HVAC) systems.
This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction.
    `.trim();

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ contractText }),
    });

    const res = await analyzeHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.documentTitle).toBeDefined();
    expect(json.overallRiskScore).toBeGreaterThanOrEqual(0);
    expect(json.clauses.length).toBeGreaterThan(0);
    expect(json.metadata.engineName).toBeDefined();

    // Verify efficiency and latency observability headers
    expect(res.headers.get('Cache-Control')).toBe('no-store, max-age=0');
    expect(res.headers.get('Server-Timing')).toMatch(/ai;dur=\d+/);

    // Verify grounding verification chips are attached
    const firstClause = json.clauses[0];
    expect(firstClause.citation).toBeDefined();
    expect(['VERIFIED', 'PARAPHRASED', 'UNVERIFIED']).toContain(firstClause.citation.status);
  });
});

describe('API Route: /api/negotiate', () => {
  it('generates a counter-proposal for a given clause', async () => {
    const req = new NextRequest('http://localhost:3000/api/negotiate', {
      method: 'POST',
      body: JSON.stringify({
        clauseId: 'clause-1',
        clauseTitle: 'Right of Entry',
        originalClause: 'Landlord may enter premises at any time without notice.',
        potentialRisk: 'Violates tenant privacy.',
      }),
    });

    const res = await negotiateHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.revisedFairClause).toBeDefined();
    expect(json.readyToSendDraft).toBeDefined();
    expect(json.rationale).toBeDefined();
  });

  it('returns 400 if required parameters are omitted', async () => {
    const req = new NextRequest('http://localhost:3000/api/negotiate', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await negotiateHandler(req);
    expect(res.status).toBe(400);
  });
});

describe('API Route: /api/chat', () => {
  it('answers questions grounded in the contract text', async () => {
    const contractText = `
Landlord reserves the right to enter the leased premises at any time without prior written notice for inspections, showings, or repairs.
    `.trim();

    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        contractText,
        question: 'Can my landlord enter without advance notice?',
      }),
    });

    const res = await chatHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.answer).toBeDefined();
    expect(Array.isArray(json.citations)).toBe(true);
  });
});

describe('API Error Mapping (Auth, Quota, Timeout taxonomy)', () => {
  it('maps 429 quota exhaustion messages to HTTP 429', async () => {
    const { mapErrorToResponse } = await import('@/lib/apiError');
    const result = mapErrorToResponse(new Error('Gemini Quota Exceeded (HTTP 429): RESOURCE_EXHAUSTED'));
    expect(result.statusCode).toBe(429);
  });

  it('maps auth errors to HTTP 401', async () => {
    const { mapErrorToResponse } = await import('@/lib/apiError');
    const result = mapErrorToResponse(new Error('Gemini Authentication Error: Invalid or expired API Key'));
    expect(result.statusCode).toBe(401);
  });

  it('maps request timeouts to HTTP 504', async () => {
    const { mapErrorToResponse } = await import('@/lib/apiError');
    const result = mapErrorToResponse(new Error('Gemini API request timed out after 30 seconds'));
    expect(result.statusCode).toBe(504);
  });

  it('maps unknown errors to HTTP 500', async () => {
    const { mapErrorToResponse } = await import('@/lib/apiError');
    const result = mapErrorToResponse(new Error('Unexpected system error'));
    expect(result.statusCode).toBe(500);
  });
});
