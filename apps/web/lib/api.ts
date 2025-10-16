/**
 * Typed API client for CollectIQ backend
 * Handles authentication, error parsing, retries, and schema validation
 */

import { env } from './env';
import {
  type PresignRequest,
  type PresignResponse,
  PresignResponseSchema,
  type Card,
  type CreateCardRequest,
  CardSchema,
  type ListCardsResponse,
  ListCardsResponseSchema,
  type RevalueRequest,
  type RevalueResponse,
  RevalueResponseSchema,
  type ProblemDetails,
  ProblemDetailsSchema,
} from '@collectiq/shared';

// ============================================================================
// Types
// ============================================================================

/**
 * API client error with ProblemDetails
 */
export class ApiError extends Error {
  constructor(
    public problem: ProblemDetails,
    public response?: Response
  ) {
    super(problem.detail || problem.title);
    this.name = 'ApiError';
  }
}

/**
 * Request options for API calls
 */
interface RequestOptions extends RequestInit {
  retry?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

// ============================================================================
// Request ID Generation
// ============================================================================

/**
 * Generate a unique request ID for traceability
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Parse error response into ProblemDetails format
 */
async function parseProblemDetails(
  response: Response
): Promise<ProblemDetails> {
  const contentType = response.headers.get('content-type');

  // Try to parse JSON response
  if (contentType?.includes('application/json')) {
    try {
      const json = await response.json();

      // Try to parse as ProblemDetails
      const parsed = ProblemDetailsSchema.safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }

      // Convert generic error to ProblemDetails
      return {
        type: 'about:blank',
        title: json.error || json.message || 'Request failed',
        status: response.status,
        detail: json.detail || json.message || response.statusText,
        requestId: json.requestId,
      };
    } catch {
      // Fall through to default error
    }
  }

  // Default ProblemDetails for non-JSON responses
  return {
    type: 'about:blank',
    title: getDefaultErrorTitle(response.status),
    status: response.status,
    detail: response.statusText || 'An error occurred',
  };
}

/**
 * Get default error title based on status code
 */
function getDefaultErrorTitle(status: number): string {
  switch (status) {
    case 400:
      return 'Bad Request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not Found';
    case 413:
      return 'Payload Too Large';
    case 415:
      return 'Unsupported Media Type';
    case 429:
      return 'Too Many Requests';
    case 500:
      return 'Internal Server Error';
    case 502:
      return 'Bad Gateway';
    case 503:
      return 'Service Unavailable';
    default:
      return 'Request Failed';
  }
}

// ============================================================================
// Retry Logic
// ============================================================================

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt: number, baseDelay: number): number {
  return baseDelay * Math.pow(2, attempt - 1);
}

/**
 * Check if error is retryable
 */
function isRetryableError(status: number): boolean {
  // Retry on 5xx errors and 429 (rate limit)
  return status >= 500 || status === 429;
}

// ============================================================================
// Core Request Function
// ============================================================================

/**
 * Make an HTTP request with retry logic and error handling
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    retry = false,
    retryAttempts = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  const url = `${env.NEXT_PUBLIC_API_BASE}${endpoint}`;
  const requestId = generateRequestId();

  // Add default headers
  const headers = new Headers(fetchOptions.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('X-Request-ID', requestId);

  let lastError: ApiError | null = null;

  // Retry loop
  for (let attempt = 1; attempt <= (retry ? retryAttempts : 1); attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: 'include', // Include cookies for JWT
      });

      // Success response
      if (response.ok) {
        // Handle empty responses (204 No Content, DELETE operations)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
          return {} as T;
        }

        const data = await response.json();
        return data as T;
      }

      // Parse error response
      const problem = await parseProblemDetails(response);
      problem.requestId = problem.requestId || requestId;
      lastError = new ApiError(problem, response);

      // Check if we should retry
      if (retry && attempt < retryAttempts && isRetryableError(response.status)) {
        const delay = getBackoffDelay(attempt, retryDelay);
        await sleep(delay);
        continue;
      }

      // No retry, throw error
      throw lastError;
    } catch (error) {
      // Network error or other exception
      if (error instanceof ApiError) {
        throw error;
      }

      // Convert to ProblemDetails
      const problem: ProblemDetails = {
        type: 'about:blank',
        title: 'Network Error',
        status: 0,
        detail: error instanceof Error ? error.message : 'Network request failed',
        requestId,
      };

      lastError = new ApiError(problem);

      // Retry on network errors
      if (retry && attempt < retryAttempts) {
        const delay = getBackoffDelay(attempt, retryDelay);
        await sleep(delay);
        continue;
      }

      throw lastError;
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError!;
}

// ============================================================================
// API Client Methods
// ============================================================================

/**
 * Get presigned URL for S3 upload
 */
export async function getPresignedUrl(
  params: PresignRequest
): Promise<PresignResponse> {
  const response = await request<unknown>('/upload/presign', {
    method: 'POST',
    body: JSON.stringify(params),
    retry: false, // Don't retry POST requests
  });

  // Validate response with Zod schema
  return PresignResponseSchema.parse(response);
}

/**
 * Create a new card
 */
export async function createCard(data: CreateCardRequest): Promise<Card> {
  const response = await request<unknown>('/cards', {
    method: 'POST',
    body: JSON.stringify(data),
    retry: false,
  });

  // Validate response with Zod schema
  return CardSchema.parse(response);
}

/**
 * Get paginated list of cards
 */
export async function getCards(params?: {
  cursor?: string;
  limit?: number;
}): Promise<ListCardsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.cursor) searchParams.set('cursor', params.cursor);
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const query = searchParams.toString();
  const endpoint = query ? `/cards?${query}` : '/cards';

  const response = await request<unknown>(endpoint, {
    method: 'GET',
    retry: true, // Retry GET requests
  });

  // Validate response with Zod schema
  return ListCardsResponseSchema.parse(response);
}

/**
 * Get a single card by ID
 */
export async function getCard(cardId: string): Promise<Card> {
  const response = await request<unknown>(`/cards/${cardId}`, {
    method: 'GET',
    retry: true,
  });

  // Validate response with Zod schema
  return CardSchema.parse(response);
}

/**
 * Delete a card
 */
export async function deleteCard(cardId: string): Promise<{ ok: boolean }> {
  await request(`/cards/${cardId}`, {
    method: 'DELETE',
    retry: false,
  });

  return { ok: true };
}

/**
 * Refresh valuation for a card
 */
export async function refreshValuation(
  cardId: string,
  forceRefresh = false
): Promise<RevalueResponse> {
  const data: RevalueRequest = {
    cardId,
    forceRefresh,
  };

  const response = await request<unknown>(`/cards/${cardId}/revalue`, {
    method: 'POST',
    body: JSON.stringify(data),
    retry: false,
  });

  // Validate response with Zod schema
  return RevalueResponseSchema.parse(response);
}

// ============================================================================
// Exports
// ============================================================================

export const api = {
  getPresignedUrl,
  createCard,
  getCards,
  getCard,
  deleteCard,
  refreshValuation,
};
