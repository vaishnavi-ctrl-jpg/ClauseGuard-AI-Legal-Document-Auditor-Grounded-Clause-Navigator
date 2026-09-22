// ==============================================================================
// ClauseGuard: AI Provider Factory & Dependency Injection Resolver
// ==============================================================================

import { LegalAiProvider } from './provider';
import { GeminiAiProvider } from './geminiProvider';
import { MockAiProvider } from './mockProvider';

let activeProviderOverride: LegalAiProvider | null = null;
let cachedProvider: LegalAiProvider | null = null;
let cachedKey = '';
let cachedModel = '';

/**
 * For testing purposes: allows unit tests to inject mock or stub providers cleanly.
 */
export function setProviderOverrideForTests(provider: LegalAiProvider | null): void {
  activeProviderOverride = provider;
}

/**
 * Resolves the appropriate AI provider (Cached Singleton for maximum efficiency):
 * 1. Checks test override (if configured)
 * 2. Returns cached provider singleton if environment configuration has not changed
 * 3. Checks GEMINI_API_KEY from process.env:
 *    - If present: instantiates and caches live GeminiAiProvider
 *    - If missing: instantiates and caches MockAiProvider with explicit demo disclosure
 */
export function getLegalAiProvider(): LegalAiProvider {
  if (activeProviderOverride) {
    return activeProviderOverride;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim() || '';
  const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-1.5-flash';

  if (cachedProvider && cachedKey === apiKey && cachedModel === modelName) {
    return cachedProvider;
  }

  cachedKey = apiKey;
  cachedModel = modelName;

  if (apiKey && apiKey.length > 0) {
    cachedProvider = new GeminiAiProvider(apiKey, modelName);
    return cachedProvider;
  }

  // Explicit Demo Mode when no key is provided
  cachedProvider = new MockAiProvider();
  return cachedProvider;
}
