import { getAccessToken, signIn } from './auth';
import { env } from './env';
import {
  PresignRequest,
  PresignResponse,
  CreateCardRequest,
  ListCardsResponse,
  Card,
  ProblemDetails,
  ProblemDetailsSchema,
  RevalueResponse,
} from '@collectiq/shared';

/**
 * API request options
 */
export interface ApiRequestOptions extends RequestInit {
  /** Skip automatic authentication (for public endpoints) */
  skipAuth?: boolean;
  /** Custom headers to merge with defaults */
  headers?: HeadersInit;
}

/**
 * API error class with status code and response details
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public response?: unknown,
    public problem?: ProblemDetails
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Make an authenticated API request to the backend
 * Automatically adds Authorization header with access token
 * Handles 401 responses by attempting token refresh and retry
 *
 * @param endpoint - API endpoint path (e.g., '/cards', '/upload/presign')
 * @param options - Fetch options with optional skipAuth flag
 * @returns Typed response data
 * @throws ApiError on HTTP errors or network failures
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...fetchOptions } = options;

  // Build full URL
  const url = `${env.NEXT_PUBLIC_API_BASE}${endpoint}`;

  // Prepare headers
  const headers = new Headers(customHeaders);
  headers.set('Content-Type', 'application/json');

  // Add Authorization header if not skipping auth
  if (!skipAuth) {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      // No token available - redirect to sign in
      await signIn();
      throw new ApiError(401, 'Unauthorized', 'No access token available');
    }
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  try {
    // Make the request
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle 401 - token might be expired, Amplify should have refreshed it
    if (response.status === 401 && !skipAuth) {
      // Try one more time with fresh token
      const freshToken = await getAccessToken();
      if (freshToken) {
        headers.set('Authorization', `Bearer ${freshToken}`);
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers,
        });

        if (retryResponse.ok) {
          return await retryResponse.json();
        }

        // Still 401 after retry - redirect to sign in
        if (retryResponse.status === 401) {
          await signIn();
        }

        throw new ApiError(
          retryResponse.status,
          retryResponse.statusText,
          `API request failed: ${retryResponse.statusText}`,
          await retryResponse.text()
        );
      }

      // No fresh token - redirect to sign in
      await signIn();
      throw new ApiError(401, 'Unauthorized', 'Session expired');
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API request failed: ${response.statusText}`;
      let problem: ProblemDetails | undefined;

      try {
        const parsed = JSON.parse(errorText);
        const result = ProblemDetailsSchema.safeParse(parsed);
        if (result.success) {
          problem = result.data;
          errorMessage = problem.detail || problem.title || errorMessage;
        } else if (parsed && typeof parsed.message === 'string') {
          errorMessage = parsed.message;
        } else if (typeof parsed === 'string') {
          errorMessage = parsed;
        }
      } catch {
        if (errorText) errorMessage = errorText;
      }

      throw new ApiError(
        response.status,
        response.statusText,
        errorMessage,
        errorText,
        problem
      );
    }

    // Parse and return response
    if (response.status === 204) {
      return undefined as T;
    }
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return data as T;
    }
    // Fallback to text for non-JSON responses
    const text = await response.text();
    return text as unknown as T;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      0,
      'Network Error',
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
const baseApi = {
  get: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
};

/**
 * High-level API helpers (typed)
 */

export async function getPresignedUrl(
  params: PresignRequest
): Promise<PresignResponse> {
  return api.post<PresignResponse>('/upload/presign', params);
}

export async function createCard(data: CreateCardRequest): Promise<Card> {
  return api.post<Card>('/cards', data);
}

export async function getCards(params?: {
  cursor?: string;
  limit?: number;
}): Promise<ListCardsResponse> {
  const search = new URLSearchParams();
  if (params?.cursor) search.set('cursor', params.cursor);
  if (params?.limit) search.set('limit', String(params.limit));
  const qs = search.toString();
  return api.get<ListCardsResponse>(`/cards${qs ? `?${qs}` : ''}`);
}

export async function getCard(cardId: string): Promise<Card> {
  return api.get<Card>(`/cards/${cardId}`);
}

export async function deleteCard(cardId: string): Promise<{ ok: boolean }> {
  await api.delete(`/cards/${cardId}`);
  return { ok: true };
}

export async function refreshValuation(
  cardId: string,
  forceRefresh?: boolean
): Promise<RevalueResponse> {
  return api.post<RevalueResponse>('/cards/revalue', { cardId, forceRefresh });
}

// Public API client type including typed helpers
export interface ApiClient {
  get: <T = unknown>(endpoint: string, options?: ApiRequestOptions) => Promise<T>;
  post: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) => Promise<T>;
  put: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) => Promise<T>;
  delete: <T = unknown>(endpoint: string, options?: ApiRequestOptions) => Promise<T>;
  patch: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) => Promise<T>;

  getPresignedUrl: (params: PresignRequest) => Promise<PresignResponse>;
  createCard: (data: CreateCardRequest) => Promise<Card>;
  getCards: (params?: { cursor?: string; limit?: number }) => Promise<ListCardsResponse>;
  getCard: (cardId: string) => Promise<Card>;
  deleteCard: (cardId: string) => Promise<{ ok: boolean }>;
  refreshValuation: (cardId: string, forceRefresh?: boolean) => Promise<RevalueResponse>;
}

export const api: ApiClient = {
  ...baseApi,
  getPresignedUrl,
  createCard,
  getCards,
  getCard,
  deleteCard,
  refreshValuation,
};
