// ==============================================================================
// ClauseGuard: Strict Request Body Validation Schemas (Zod)
// ==============================================================================

import { z } from 'zod';

export const AnalyzeRequestSchema = z.object({
  contractText: z
    .string({ required_error: 'contractText is required' })
    .min(20, 'Contract text must be at least 20 characters')
    .max(75000, 'Contract text exceeds maximum limit of 75,000 characters'),
});

export const NegotiateRequestSchema = z.object({
  clauseId: z.string().optional(),
  clauseTitle: z.string().min(1, 'clauseTitle is required').max(300),
  originalClause: z.string().min(1, 'originalClause is required').max(5000),
  potentialRisk: z.string().optional(),
});

export const ChatRequestSchema = z.object({
  contractText: z.string().min(20, 'contractText must be at least 20 characters').max(75000),
  question: z.string().min(3, 'Question must be at least 3 characters').max(500),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export type NegotiateRequest = z.infer<typeof NegotiateRequestSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
