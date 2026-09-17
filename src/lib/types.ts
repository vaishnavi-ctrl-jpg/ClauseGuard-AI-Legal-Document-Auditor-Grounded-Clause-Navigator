// ==============================================================================
// ClauseGuard: Data Contracts & Type Definitions
// ==============================================================================

export type RiskLevel = 'CRITICAL' | 'CAUTION' | 'FAIR';

export type CitationStatus = 'VERIFIED' | 'PARAPHRASED' | 'UNVERIFIED';

export interface GroundedCitation {
  quote: string;
  status: CitationStatus;
  matchScore: number; // 0.0 to 1.0
  lineIndex?: number;
  matchSnippet?: string;
}

export interface ClauseItem {
  id: string;
  title: string;
  riskLevel: RiskLevel;
  category: 'Liability' | 'Financial' | 'Termination' | 'Privacy' | 'Dispute' | 'General';
  legaleseSnippet: string;
  plainEnglishExplanation: string;
  potentialRisk: string;
  suggestedAction: string;
  citation: GroundedCitation;
}

export interface RiskBreakdown {
  liabilityScore: number; // 0 - 100
  financialScore: number; // 0 - 100
  exitDifficultyScore: number; // 0 - 100
  privacyScore: number; // 0 - 100
}

export interface PreSigningChecklistItem {
  id: string;
  task: string;
  category: string;
  urgency: 'URGENT' | 'RECOMMENDED' | 'OPTIONAL';
  completed: boolean;
}

export interface DocumentAnalysis {
  documentTitle: string;
  overallRiskScore: number; // 0 (Safe) - 100 (Extremely Hostile)
  riskTier: RiskLevel;
  summary: string;
  riskBreakdown: RiskBreakdown;
  clauses: ClauseItem[];
  checklist: PreSigningChecklistItem[];
  metadata: {
    engineName: string;
    isDemo: boolean;
    latencyMs: number;
    wordCount: number;
    analyzedAt: string;
  };
}

export interface CounterProposal {
  clauseId: string;
  clauseTitle: string;
  originalClause: string;
  revisedFairClause: string;
  rationale: string;
  readyToSendDraft: string;
  metadata: {
    engineName: string;
    isDemo: boolean;
    latencyMs: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: GroundedCitation[];
  isDemo?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}
