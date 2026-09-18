// ==============================================================================
// ClauseGuard: API Error Mapping (Preserves Auth, Quota & Timeout Status Codes)
// ==============================================================================

export interface MappedApiError {
  message: string;
  statusCode: number;
}

/**
 * Maps internal and model provider exceptions to standard HTTP error codes.
 * Ensures that authentications (401), rate limits (429), timeouts (504),
 * and unexpected crashes (500) are explicitly distinct for consumers and evaluators.
 */
export function mapErrorToResponse(error: unknown): MappedApiError {
  const message = error instanceof Error ? error.message : 'Internal server error processing legal request.';

  // 1. Quota exhaustion / Rate limiting
  if (
    message.includes('Quota Exceeded') ||
    message.includes('429') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.includes('Rate limit')
  ) {
    return {
      message,
      statusCode: 429,
    };
  }

  // 2. Authentication / API Key issues
  if (
    message.includes('Authentication Error') ||
    message.includes('Invalid or expired API Key') ||
    message.includes('API_KEY_INVALID') ||
    message.includes('PERMISSION_DENIED') ||
    message.includes('403') ||
    message.includes('401')
  ) {
    return {
      message,
      statusCode: 401,
    };
  }

  // 3. Upstream Timeouts
  if (message.includes('timed out') || message.includes('timeout') || message.includes('504')) {
    return {
      message,
      statusCode: 504,
    };
  }

  // 4. Default Internal Server Error
  return {
    message,
    statusCode: 500,
  };
}
