// ==============================================================================
// ClauseGuard Unit Tests: AI Provider & Dependency Injection
// ==============================================================================

import { describe, it, expect } from 'vitest';
import { MockAiProvider } from '@/lib/ai/mockProvider';
import { GeminiAiProvider } from '@/lib/ai/geminiProvider';
import { getLegalAiProvider, setProviderOverrideForTests } from '@/lib/ai/factory';
import { LegalAiProvider } from '@/lib/ai/provider';
import { SAMPLE_CONTRACTS } from '@/lib/sampleContracts';

describe('MockAiProvider (Demo / Offline Engine)', () => {
  const mockProvider = new MockAiProvider();

  it('declares isDemo = true and discloses engine name', () => {
    expect(mockProvider.isDemo).toBe(true);
    expect(mockProvider.engineName).toContain('Demo');
  });

  it('generates structured document analysis with valid risk boundaries', async () => {
    const sampleLease = 'Landlord reserves the right to enter premises at any time. Tenant must pay rent.';
    const analysis = await mockProvider.analyzeDocument(sampleLease);

    expect(analysis.overallRiskScore).toBeGreaterThanOrEqual(0);
    expect(analysis.overallRiskScore).toBeLessThanOrEqual(100);
    expect(['CRITICAL', 'CAUTION', 'FAIR']).toContain(analysis.riskTier);
    expect(analysis.clauses.length).toBeGreaterThan(0);

    const firstClause = analysis.clauses[0];
    expect(firstClause.title).toBeDefined();
    expect(firstClause.legaleseSnippet).toBeDefined();
    expect(firstClause.plainEnglishExplanation).toBeDefined();
  });

  it('generates balanced counter-proposals with email drafts', async () => {
    const proposal = await mockProvider.draftCounterProposal(
      'Right of Entry',
      'Landlord may enter at any time without notice',
      'Violates tenant privacy'
    );

    expect(proposal.revisedFairClause).toContain('MUTUAL REVISION');
    expect(proposal.readyToSendDraft).toContain('Dear Team');
    expect(proposal.rationale).toBeDefined();
  });

  it('answers questions grounded in contract text', async () => {
    const res = await mockProvider.answerQuestion('Landlord entry clause...', 'Can landlord enter without notice?');
    expect(res.answer).toBeDefined();
    expect(Array.isArray(res.citedQuotes)).toBe(true);
  });

  it('analyzes diverse realistic contract domains from SAMPLE_CONTRACTS', async () => {
    for (const contract of SAMPLE_CONTRACTS) {
      const analysis = await mockProvider.analyzeDocument(contract.text);
      expect(analysis.clauses.length).toBeGreaterThan(0);
      expect(analysis.overallRiskScore).toBeGreaterThanOrEqual(0);
      expect(analysis.riskTier).toBeDefined();
    }
  });
});

describe('GeminiAiProvider (Live Engine & Fail-Closed Guardrails)', () => {
  it('throws an error if instantiated without an API key', () => {
    expect(() => new GeminiAiProvider('')).toThrow('initialized without an API key');
  });
});

describe('Provider Factory & Test Override Injection', () => {
  it('allows clean test override injection', () => {
    const customTestDouble: LegalAiProvider = {
      engineName: 'TestDoubleEngine',
      isDemo: true,
      analyzeDocument: async () => ({
        documentTitle: 'Test Double Document',
        overallRiskScore: 25,
        riskTier: 'FAIR',
        summary: 'Stub summary for unit testing',
        riskBreakdown: { liabilityScore: 10, financialScore: 10, exitDifficultyScore: 10, privacyScore: 10 },
        clauses: [],
        checklist: [],
      }),
      draftCounterProposal: async () => ({
        clauseId: 'test-1',
        clauseTitle: 'Test',
        originalClause: 'Original',
        revisedFairClause: 'Fair',
        rationale: 'Reason',
        readyToSendDraft: 'Draft',
      }),
      answerQuestion: async () => ({
        answer: 'Stub answer',
        citedQuotes: [],
      }),
    };

    setProviderOverrideForTests(customTestDouble);
    const activeProvider = getLegalAiProvider();
    expect(activeProvider.engineName).toBe('TestDoubleEngine');

    // Reset override
    setProviderOverrideForTests(null);
  });
});
