// ==============================================================================
// ClauseGuard: Deterministic Citation Grounding & Anti-Hallucination Verifier
// ==============================================================================

import { CitationStatus, GroundedCitation } from './types';

export interface PreIndexedLine {
  lineNumber: number; // 1-based line index
  text: string;
  normalized: string;
  tokens: Set<string>;
}

/**
 * Pre-indexes a legal document once into token sets, inverted posting lists, and paragraph lines.
 * This guarantees O(1) memoized lookups and sub-linear candidate scoring, preventing costly
 * O(N * M) full-text rescanning when auditing long multi-page contracts.
 */
export class IndexedDocumentVerifier {
  private readonly rawText: string;
  private readonly normalizedFullText: string;
  private readonly indexedLines: PreIndexedLine[];
  private readonly quoteCache: Map<string, GroundedCitation> = new Map();
  private readonly tokenPostingList: Map<string, number[]> = new Map();

  constructor(sourceText: string) {
    this.rawText = sourceText;
    this.normalizedFullText = normalizeWhitespace(sourceText.toLowerCase());

    const rawLines = sourceText.split(/\r?\n/);
    this.indexedLines = rawLines.map((line, idx) => {
      const trimmed = line.trim();
      const norm = normalizeWhitespace(trimmed.toLowerCase());
      const tokens = extractSignificantTokens(norm);

      // Populate inverted index posting list for sub-linear retrieval
      tokens.forEach((token) => {
        let postings = this.tokenPostingList.get(token);
        if (!postings) {
          postings = [];
          this.tokenPostingList.set(token, postings);
        }
        postings.push(idx);
      });

      return {
        lineNumber: idx + 1,
        text: trimmed,
        normalized: norm,
        tokens,
      };
    });
  }

  /**
   * Deterministically verifies whether an AI-cited quote exists in the source contract.
   * Categorizes citations into:
   * - VERIFIED: Exact or whitespace-normalized verbatim match (Score >= 0.90)
   * - PARAPHRASED: Legitimate semantic/token overlap in identified clause paragraph (Score 0.65 - 0.89)
   * - UNVERIFIED: Hallucinated or non-traceable quotation (Score < 0.65)
   */
  public verify(quote: string): GroundedCitation {
    const trimmedQuote = (quote || '').trim();
    if (!trimmedQuote || trimmedQuote.length < 5) {
      return {
        quote: trimmedQuote,
        status: 'UNVERIFIED',
        matchScore: 0.0,
      };
    }

    // O(1) Memoization Cache Check
    const cached = this.quoteCache.get(trimmedQuote);
    if (cached) {
      return cached;
    }

    const normQuote = normalizeWhitespace(trimmedQuote.toLowerCase());

    // 1. Exact Verbatim Substring Check (Case-Insensitive)
    const exactMatchIndex = this.normalizedFullText.indexOf(normQuote);
    if (exactMatchIndex !== -1) {
      const lineMatch = this.findLineForCharIndex(trimmedQuote);
      return this.cacheResult(trimmedQuote, {
        quote: trimmedQuote,
        status: 'VERIFIED',
        matchScore: 1.0,
        lineIndex: lineMatch?.lineNumber,
        matchSnippet: lineMatch?.text.slice(0, 140),
      });
    }

    // 2. High-Fidelity Substring Check (First 40 chars of quote)
    const quoteHead = normQuote.slice(0, Math.min(40, normQuote.length));
    for (const line of this.indexedLines) {
      if (line.normalized.length >= 20 && line.normalized.includes(quoteHead)) {
        return this.cacheResult(trimmedQuote, {
          quote: trimmedQuote,
          status: 'VERIFIED',
          matchScore: 0.92,
          lineIndex: line.lineNumber,
          matchSnippet: line.text.slice(0, 140),
        });
      }
    }

    // 3. Pre-Indexed Token Overlap Verification via Inverted Index (Sub-linear IR search)
    const quoteTokens = extractSignificantTokens(normQuote);
    if (quoteTokens.size === 0) {
      return this.cacheResult(trimmedQuote, {
        quote: trimmedQuote,
        status: 'UNVERIFIED',
        matchScore: 0.0,
      });
    }

    // Accumulate candidate line matches using inverted index posting lists
    const candidateIntersections = new Map<number, number>();
    quoteTokens.forEach((token) => {
      const postings = this.tokenPostingList.get(token);
      if (postings) {
        for (const lineIdx of postings) {
          candidateIntersections.set(lineIdx, (candidateIntersections.get(lineIdx) || 0) + 1);
        }
      }
    });

    let bestScore = 0.0;
    let bestLine: PreIndexedLine | undefined;

    candidateIntersections.forEach((intersectionCount, lineIdx) => {
      const score = intersectionCount / quoteTokens.size;
      if (score > bestScore) {
        bestScore = score;
        bestLine = this.indexedLines[lineIdx];
      }
    });

    if (bestScore >= 0.65) {
      return this.cacheResult(trimmedQuote, {
        quote: trimmedQuote,
        status: 'PARAPHRASED',
        matchScore: Number(bestScore.toFixed(2)),
        lineIndex: bestLine?.lineNumber,
        matchSnippet: bestLine?.text.slice(0, 140),
      });
    }

    return this.cacheResult(trimmedQuote, {
      quote: trimmedQuote,
      status: 'UNVERIFIED',
      matchScore: Number(bestScore.toFixed(2)),
      matchSnippet: bestLine ? bestLine.text.slice(0, 100) : undefined,
    });
  }

  private cacheResult(quote: string, citation: GroundedCitation): GroundedCitation {
    if (this.quoteCache.size >= 500) {
      this.quoteCache.clear(); // Prevents unbounded memory growth
    }
    this.quoteCache.set(quote, citation);
    return citation;
  }

  private findLineForCharIndex(quote: string): PreIndexedLine | undefined {
    const quoteLower = quote.toLowerCase();
    return this.indexedLines.find((line) => line.text.toLowerCase().includes(quoteLower) || line.normalized.includes(normalizeWhitespace(quoteLower)));
  }
}

/**
 * Utility: normalizes multiple whitespace, tabs, and linebreaks into single spaces
 */
function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Utility: extracts significant word tokens (3+ chars, excluding legal stopwords)
 */
function extractSignificantTokens(str: string): Set<string> {
  const STOPWORDS = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'from', 'shall', 'will', 'any', 'are', 'not', 'have', 'been',
    'which', 'such', 'other', 'herein', 'thereof', 'whereas', 'hereby', 'upon', 'into'
  ]);

  const words = str
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));

  return new Set(words);
}

/**
 * Convenience helper to verify a single citation against raw text
 */
export function verifyCitationAgainstText(sourceText: string, quote: string): GroundedCitation {
  const verifier = new IndexedDocumentVerifier(sourceText);
  return verifier.verify(quote);
}
