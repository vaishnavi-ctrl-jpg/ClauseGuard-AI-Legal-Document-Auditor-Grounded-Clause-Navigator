// ==============================================================================
// ClauseGuard: Live Google Gemini AI Provider (Robust, Retry-Enabled, Fail-Closed)
// ==============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  LegalAiProvider,
  RawDocumentAnalysis,
  RawCounterProposal,
  RawChatAnswer,
} from './provider';

export class GeminiAiProvider implements LegalAiProvider {
  public readonly engineName: string;
  public readonly isDemo = false;
  private readonly genAI: GoogleGenerativeAI;
  private readonly modelName: string;

  constructor(apiKey: string, modelName = 'gemini-1.5-flash') {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('GeminiAiProvider initialized without an API key.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey.trim());
    this.modelName = modelName;
    this.engineName = `Google Gemini (${modelName})`;
  }

  /**
   * Calls Gemini with exponential backoff retries and strict 30s timeout.
   * Fails closed with descriptive errors on 400/403/429.
   */
  private async executeWithRetry<T>(
    prompt: string,
    systemInstruction: string,
    parseFn: (text: string) => T,
    maxRetries = 2
  ): Promise<T> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1, // Low temperature for deterministic legal reasoning
      },
    });

    let attempt = 0;
    while (attempt <= maxRetries) {
      attempt++;
      try {
        // Enforce 30s strict timeout
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API request timed out after 30 seconds.')), 30000)
        );

        const generatePromise = model.generateContent(prompt);
        const result = await Promise.race([generatePromise, timeoutPromise]);
        const responseText = result.response.text();

        return parseFn(responseText);
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : String(err);

        // Fail-Closed: Do NOT retry or mask auth/quota/validation errors
        if (
          errMessage.includes('API_KEY_INVALID') ||
          errMessage.includes('400') ||
          errMessage.includes('403') ||
          errMessage.includes('PERMISSION_DENIED')
        ) {
          throw new Error(`Gemini Authentication Error: Invalid or expired API Key (${errMessage})`);
        }

        if (errMessage.includes('429') || errMessage.includes('RESOURCE_EXHAUSTED')) {
          throw new Error('Gemini Quota Exceeded (HTTP 429): Rate limit or quota exhausted on provided API key.');
        }

        if (attempt > maxRetries) {
          throw new Error(`Gemini API Error after ${maxRetries + 1} attempts: ${errMessage}`);
        }

        // Exponential backoff wait for transient network errors (1s, 2s)
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }

    throw new Error('Unexpected execution failure in Gemini provider.');
  }

  async analyzeDocument(contractText: string): Promise<RawDocumentAnalysis> {
    const systemInstruction = `You are ClauseGuard, an expert legal contract auditor.
Your job is to analyze legal documents for consumers, tenants, and small business owners.
You must return a strictly valid JSON object conforming to this schema:
{
  "documentTitle": string,
  "overallRiskScore": number (0 to 100, where 0 is completely fair and 100 is predatory/hostile),
  "riskTier": "CRITICAL" | "CAUTION" | "FAIR",
  "summary": string (3-4 sentences in clear, accessible plain English),
  "riskBreakdown": {
    "liabilityScore": number (0-100),
    "financialScore": number (0-100),
    "exitDifficultyScore": number (0-100),
    "privacyScore": number (0-100)
  },
  "clauses": [
    {
      "id": string (unique, e.g. "clause-1"),
      "title": string,
      "riskLevel": "CRITICAL" | "CAUTION" | "FAIR",
      "category": "Liability" | "Financial" | "Termination" | "Privacy" | "Dispute" | "General",
      "legaleseSnippet": string (MUST be an EXACT quote from the provided contract text for citation verification),
      "plainEnglishExplanation": string (8th-grade reading level explanation of what this means),
      "potentialRisk": string (what the user risks losing or being charged with),
      "suggestedAction": string (actionable advice, e.g. negotiate notice period)
    }
  ],
  "checklist": [
    {
      "id": string,
      "task": string,
      "category": string,
      "urgency": "URGENT" | "RECOMMENDED" | "OPTIONAL",
      "completed": false
    }
  ]
}
IMPORTANT: Every "legaleseSnippet" MUST be an exact verbatim substring from the input text so our grounding verification passes.`;

    const prompt = `Analyze the following legal document and extract all significant clauses, especially one-sided liabilities, penalties, arbitration waivers, and unfair terms:

--- CONTRACT TEXT ---
${contractText}
--- END CONTRACT TEXT ---`;

    return this.executeWithRetry(prompt, systemInstruction, (text) => {
      const cleanJson = cleanJsonOutput(text);
      return JSON.parse(cleanJson) as RawDocumentAnalysis;
    });
  }

  async draftCounterProposal(
    clauseTitle: string,
    originalClause: string,
    potentialRisk: string
  ): Promise<RawCounterProposal> {
    const systemInstruction = `You are a fair legal negotiator representing a consumer or contractor.
You will receive an unfair contract clause. Draft a balanced, legally standard revision and a courteous negotiation email/letter.
Return strictly valid JSON:
{
  "clauseId": "counter-1",
  "clauseTitle": string,
  "originalClause": string,
  "revisedFairClause": string (legally standard, balanced wording acceptable to reasonable parties),
  "rationale": string (why this revision is standard and protects mutual interests),
  "readyToSendDraft": string (polite, professional email template ready to send to landlord/client)
}`;

    const prompt = `Draft a fair counter-proposal for this clause:
Title: ${clauseTitle}
Original Clause: "${originalClause}"
Identified Risk: ${potentialRisk}`;

    return this.executeWithRetry(prompt, systemInstruction, (text) => {
      const cleanJson = cleanJsonOutput(text);
      return JSON.parse(cleanJson) as RawCounterProposal;
    });
  }

  async answerQuestion(contractText: string, question: string): Promise<RawChatAnswer> {
    const systemInstruction = `You are ClauseGuard's Grounded Legal Assistant.
Answer the user's question about the contract.
Rules:
1. Ground your answer strictly in the provided contract text.
2. In "citedQuotes", list the EXACT quotes from the contract that support your answer so our deterministic verifier can confirm them.
3. If the contract doesn't mention the topic, clearly state that it is not covered.
Return strictly valid JSON:
{
  "answer": string (plain English explanation with guidance),
  "citedQuotes": [string] (exact quotes from the contract text)
}`;

    const prompt = `Contract Text:
${contractText}

User Question: "${question}"`;

    return this.executeWithRetry(prompt, systemInstruction, (text) => {
      const cleanJson = cleanJsonOutput(text);
      return JSON.parse(cleanJson) as RawChatAnswer;
    });
  }
}

/**
 * Strips markdown backticks if returned
 */
function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}
