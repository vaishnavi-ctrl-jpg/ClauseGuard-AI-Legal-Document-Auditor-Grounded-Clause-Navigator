// ==============================================================================
// ClauseGuard Unit Tests: Grounding & Anti-Hallucination Verifier
// ==============================================================================

import { describe, it, expect } from 'vitest';
import { IndexedDocumentVerifier } from '@/lib/groundingVerifier';

describe('IndexedDocumentVerifier (Deterministic Grounding)', () => {
  const sampleContract = `
SECTION 1: RENT AND OCCUPANCY
Tenant agrees to pay monthly rent of $2,000 on the first day of each month.

SECTION 2: ENTRY AND INSPECTIONS
Landlord reserves the right to enter the leased premises at any time without prior written notice for inspections.

SECTION 3: SECURITY DEPOSIT
The security deposit shall be held by Landlord and returned within thirty days.
  `.trim();

  const verifier = new IndexedDocumentVerifier(sampleContract);

  it('verifies exact verbatim quotes with 1.0 match score and line index', () => {
    const quote = 'Landlord reserves the right to enter the leased premises at any time without prior written notice for inspections.';
    const result = verifier.verify(quote);

    expect(result.status).toBe('VERIFIED');
    expect(result.matchScore).toBeGreaterThanOrEqual(0.95);
    expect(result.lineIndex).toBeDefined();
  });

  it('verifies quotes with altered whitespace/newlines (normalized match)', () => {
    const quote = 'Tenant   agrees to pay   monthly rent of $2,000 on the first day';
    const result = verifier.verify(quote);

    expect(result.status).toBe('VERIFIED');
    expect(result.matchScore).toBeGreaterThanOrEqual(0.9);
  });

  it('correctly classifies legitimate paraphrases as PARAPHRASED (not false-negative unverified)', () => {
    // Paraphrased quote capturing key tokens from Section 2
    const paraphrase = 'Landlord reserves right to enter premises without prior written notice for inspections';
    const result = verifier.verify(paraphrase);

    expect(result.status).toBe('PARAPHRASED');
    expect(result.matchScore).toBeGreaterThanOrEqual(0.65);
    expect(result.lineIndex).toBeDefined();
  });

  it('flags hallucinated quotes as UNVERIFIED when not found in source document', () => {
    const hallucinatedQuote = 'Tenant must pay a pet fee of $500 and replace all hardwood flooring upon move-out.';
    const result = verifier.verify(hallucinatedQuote);

    expect(result.status).toBe('UNVERIFIED');
    expect(result.matchScore).toBeLessThan(0.65);
  });

  it('handles empty or very short quotes gracefully', () => {
    const emptyResult = verifier.verify('');
    expect(emptyResult.status).toBe('UNVERIFIED');

    const shortResult = verifier.verify('Rent');
    expect(shortResult.status).toBe('UNVERIFIED');
  });

  it('serves repeated citations from the O(1) memoization cache with identical reference', () => {
    const quote = 'SECTION 3: SECURITY DEPOSIT';
    const firstCall = verifier.verify(quote);
    const secondCall = verifier.verify(quote);

    expect(firstCall.status).toBe('VERIFIED');
    expect(secondCall).toBe(firstCall); // Exact same object reference returned from O(1) cache
  });
});
