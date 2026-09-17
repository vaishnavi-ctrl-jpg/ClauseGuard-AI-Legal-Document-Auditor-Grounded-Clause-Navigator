// ==============================================================================
// ClauseGuard: AI Provider Factory & Dependency Injection Resolver
// ==============================================================================

import { LegalAiProvider } from './provider';
import { GeminiAiProvider } from './geminiProvider';
import { MockAiProvider } from './mockProvider';

let activeProviderOverride: LegalAiProvider | null = null;

/**
 * For testing purposes: allows unit tests to inject mock or stub providers cleanly.
 */
export function setProviderOverrideForTests(provider: LegalAiProvider | null): void {
  activeProviderOverride = provider;
}

/**
 * Resolves the appropriate AI provider:
 * 1. Checks test override (if configured)
 * 2. Checks GEMINI_API_KEY from process.env:
 *    - If present: instantiates live GeminiAiProvider
 *    - If missing: instantiates MockAiProvider with explicit demo disclosure
 */
export function getLegalAiProvider(): LegalAiProvider {
  if (activeProviderOverride) {
    return activeProviderOverride;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-1.5-flash';

  if (apiKey && apiKey.length > 0) {
    return new GeminiAiProvider(apiKey, modelName);
  }

  // Explicit Demo Mode when no key is provided
  return new MockAiProvider();
}
