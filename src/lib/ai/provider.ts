// ==============================================================================
// ClauseGuard: Legal AI Provider Interface (Dependency Injection Contract)
// ==============================================================================

import { RiskLevel } from '../types';

export interface RawClauseItem {
  id: string;
  title: string;
  riskLevel: RiskLevel;
  category: 'Liability' | 'Financial' | 'Termination' | 'Privacy' | 'Dispute' | 'General';
  legaleseSnippet: string;
  plainEnglishExplanation: string;
  potentialRisk: string;
  suggestedAction: string;
}

export interface RawDocumentAnalysis {
  documentTitle: string;
  overallRiskScore: number; // 0 - 100
  riskTier: RiskLevel;
  summary: string;
  riskBreakdown: {
    liabilityScore: number;
    financialScore: number;
    exitDifficultyScore: number;
    privacyScore: number;
  };
  clauses: RawClauseItem[];
  checklist: Array<{
    id: string;
    task: string;
    category: string;
    urgency: 'URGENT' | 'RECOMMENDED' | 'OPTIONAL';
    completed: boolean;
  }>;
}

export interface RawCounterProposal {
  clauseId: string;
  clauseTitle: string;
  originalClause: string;
  revisedFairClause: string;
  rationale: string;
  readyToSendDraft: string;
}

export interface RawChatAnswer {
  answer: string;
  citedQuotes: string[];
}

/**
 * Universal contract for legal analysis engines.
 * Enables clean dependency injection across live Gemini, Mock/Demo, and test doubles.
 */
export interface LegalAiProvider {
  readonly engineName: string;
  readonly isDemo: boolean;

  /**
   * Audits a full legal document and extracts risk scores and structured clauses.
   */
  analyzeDocument(contractText: string): Promise<RawDocumentAnalysis>;

  /**
   * Generates a balanced, polite counter-clause and ready-to-send draft for a flagged clause.
   */
  draftCounterProposal(
    clauseTitle: string,
    originalClause: string,
    potentialRisk: string
  ): Promise<RawCounterProposal>;

  /**
   * Answers a natural language question grounded in the contract text.
   */
  answerQuestion(contractText: string, question: string): Promise<RawChatAnswer>;
}
