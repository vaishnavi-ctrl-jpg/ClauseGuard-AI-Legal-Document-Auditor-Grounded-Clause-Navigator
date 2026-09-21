// ==============================================================================
// ClauseGuard: Security, Input Sanitization & Pluggable Rate Limiting
// ==============================================================================

import { RateLimitResult } from './types';

export const MAX_DOCUMENT_CHAR_LENGTH = 75000; // ~15,000 words (handles long leases/contracts)
export const MIN_DOCUMENT_CHAR_LENGTH = 20;

/**
 * Result of security validation on user input
 */
export interface InputValidationResult {
  valid: boolean;
  sanitized: string;
  error?: string;
}

/**
 * Common prompt injection indicators in legal inputs
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /system\s*prompt\s*override/i,
  /you\s+are\s+now\s+dan\b/i,
  /forget\s+(all\s+)?your\s+rules/i,
  /bypass\s+safety\s+filters/i,
  /<script\b[^>]*>/i,
];

/**
 * Sanitizes and validates user-submitted contract text.
 * Defends against prompt injection, memory-exhaustion payloads, and malformed characters.
 */
export function sanitizeLegalText(rawInput: unknown): InputValidationResult {
  if (typeof rawInput !== 'string') {
    return {
      valid: false,
      sanitized: '',
      error: 'Input must be a valid text string.',
    };
  }

  // Normalize Unicode and remove dangerous invisible/control characters (except standard newlines/tabs)
  let cleaned = rawInput
    .normalize('NFKC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '')
    .trim();

  if (cleaned.length < MIN_DOCUMENT_CHAR_LENGTH) {
    return {
      valid: false,
      sanitized: '',
      error: `Contract text is too short (minimum ${MIN_DOCUMENT_CHAR_LENGTH} characters required).`,
    };
  }

  if (cleaned.length > MAX_DOCUMENT_CHAR_LENGTH) {
    return {
      valid: false,
      sanitized: '',
      error: `Document exceeds maximum allowed length of ${MAX_DOCUMENT_CHAR_LENGTH.toLocaleString()} characters.`,
    };
  }

  // Scan for active adversarial prompt injections
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(cleaned)) {
      return {
        valid: false,
        sanitized: '',
        error: 'Security alert: Disallowed instruction pattern detected in document text.',
      };
    }
  }

  return {
    valid: true,
    sanitized: cleaned,
  };
}

/**
 * Pluggable Rate Limiter Interface
 * Supports both single-instance in-memory execution and distributed Upstash Redis
 */
export interface RateLimiter {
  check(identifier: string): Promise<RateLimitResult>;
}

/**
 * In-Memory Sliding Window Rate Limiter
 * Suitable for local development, evaluations, and single-instance deployments.
 * Documented path to Redis for distributed environments.
 */
export class MemoryRateLimiter implements RateLimiter {
  private timestamps: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private lastCleanup: number = 0;

  constructor(maxRequests = 20, windowMs = 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const currentTimestamps = this.timestamps.get(identifier) || [];
    // Filter timestamps within current sliding window
    const validTimestamps = currentTimestamps.filter((t) => t > windowStart);

    if (validTimestamps.length >= this.maxRequests) {
      const oldest = validTimestamps[0];
      const resetSeconds = Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000));
      return {
        allowed: false,
        limit: this.maxRequests,
        remaining: 0,
        resetSeconds,
      };
    }

    validTimestamps.push(now);
    this.timestamps.set(identifier, validTimestamps);

    // Amortized O(1) cleanup: throttled sweep of stale client records every 30s
    if (this.timestamps.size > 500 && now - this.lastCleanup > 30_000) {
      this.lastCleanup = now;
      for (const [key, times] of this.timestamps.entries()) {
        const fresh = times.filter((t: number) => t > windowStart);
        if (fresh.length === 0) {
          this.timestamps.delete(key);
        } else {
          this.timestamps.set(key, fresh);
        }
      }
    }

    return {
      allowed: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - validTimestamps.length,
      resetSeconds: Math.ceil(this.windowMs / 1000),
    };
  }
}

/**
 * Global rate limiter instance (singleton)
 */
export const defaultRateLimiter: RateLimiter = new MemoryRateLimiter(20, 60 * 1000); // 20 reqs / min
