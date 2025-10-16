/**
 * Idempotency Middleware
 * Provides middleware for handling idempotent operations in Lambda handlers
 */

import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import type { APIGatewayProxyEventV2WithJWT } from '../auth/jwt-claims.js';
import { extractIdempotencyKey, getIdempotencyToken, saveIdempotencyToken } from './idempotency.js';
import { logger } from './logger.js';

/**
 * Handler function type that supports idempotency
 */
export type IdempotentHandler = (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyResultV2>;

/**
 * Options for idempotency middleware
 */
interface IdempotencyOptions {
  /**
   * Operation identifier (e.g., 'cards_create', 'cards_revalue')
   */
  operation: string;

  /**
   * Function to extract user ID from event
   * Defaults to extracting from JWT claims
   */
  getUserId?: (event: APIGatewayProxyEventV2) => string;

  /**
   * TTL for idempotency tokens in seconds
   * Defaults to IDEMPOTENCY_TTL_SECONDS environment variable or 600
   */
  ttlSeconds?: number;

  /**
   * Whether idempotency is required (returns 400 if key missing)
   * Defaults to false (idempotency is optional)
   */
  required?: boolean;
}

/**
 * Default function to extract user ID from JWT claims
 */
function defaultGetUserId(event: APIGatewayProxyEventV2): string {
  const eventWithJWT = event as APIGatewayProxyEventV2WithJWT;
  const claims = eventWithJWT.requestContext?.authorizer?.jwt?.claims;
  if (!claims || !claims.sub) {
    throw new Error('User ID not found in JWT claims');
  }
  return claims.sub as string;
}

/**
 * Wrap a Lambda handler with idempotency support
 *
 * This middleware:
 * 1. Extracts idempotency key from request headers
 * 2. Checks DynamoDB for existing token
 * 3. Returns cached result if token exists and not expired
 * 4. Executes handler if no token found
 * 5. Stores new token with result before returning
 *
 * @param handler - Lambda handler function to wrap
 * @param options - Idempotency configuration options
 * @returns Wrapped handler with idempotency support
 *
 * @example
 * ```typescript
 * export const handler = withIdempotency(
 *   async (event) => {
 *     // Your handler logic here
 *     return { statusCode: 201, body: JSON.stringify(result) };
 *   },
 *   { operation: 'cards_create' }
 * );
 * ```
 */
export function withIdempotency(
  handler: IdempotentHandler,
  options: IdempotencyOptions,
): IdempotentHandler {
  return async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const requestId = event.requestContext.requestId;
    const getUserId = options.getUserId || defaultGetUserId;

    try {
      // Extract idempotency key from headers
      const idempotencyKey = extractIdempotencyKey(event.headers);

      // If no idempotency key provided
      if (!idempotencyKey) {
        if (options.required) {
          logger.warn('Idempotency key required but not provided', {
            operation: 'withIdempotency',
            operationType: options.operation,
            requestId,
          });
          return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/problem+json' },
            body: JSON.stringify({
              type: '/errors/bad-request',
              title: 'Bad Request',
              status: 400,
              detail: 'Idempotency-Key header is required for this operation',
              instance: event.requestContext.http.path,
              requestId,
            }),
          };
        }

        // Idempotency is optional - proceed without it
        logger.debug('No idempotency key provided (optional)', {
          operation: 'withIdempotency',
          operationType: options.operation,
          requestId,
        });
        return handler(event);
      }

      // Extract user ID
      let userId: string;
      try {
        userId = getUserId(event);
      } catch (error) {
        logger.error(
          'Failed to extract user ID',
          error instanceof Error ? error : new Error(String(error)),
          {
            operation: 'withIdempotency',
            operationType: options.operation,
            requestId,
          },
        );
        return {
          statusCode: 401,
          headers: { 'Content-Type': 'application/problem+json' },
          body: JSON.stringify({
            type: '/errors/unauthorized',
            title: 'Unauthorized',
            status: 401,
            detail: 'User authentication required',
            instance: event.requestContext.http.path,
            requestId,
          }),
        };
      }

      logger.debug('Checking for existing idempotency token', {
        operation: 'withIdempotency',
        operationType: options.operation,
        userId,
        idempotencyKey,
        requestId,
      });

      // Check for existing token
      const cachedResult = await getIdempotencyToken(userId, idempotencyKey, requestId);

      if (cachedResult !== null) {
        logger.info('Returning cached result from idempotency token', {
          operation: 'withIdempotency',
          operationType: options.operation,
          userId,
          idempotencyKey,
          requestId,
        });

        // Return cached result
        // The cached result should be a complete APIGatewayProxyResultV2
        if (isValidProxyResult(cachedResult)) {
          return cachedResult as APIGatewayProxyResultV2;
        }

        // If cached result is not a valid proxy result, wrap it
        logger.warn('Cached result is not a valid proxy result, wrapping it', {
          operation: 'withIdempotency',
          operationType: options.operation,
          userId,
          idempotencyKey,
          requestId,
        });
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cachedResult),
        };
      }

      // No cached result - execute handler
      logger.debug('No cached result found, executing handler', {
        operation: 'withIdempotency',
        operationType: options.operation,
        userId,
        idempotencyKey,
        requestId,
      });

      const result = await handler(event);

      // Store result with idempotency token (only for successful responses)
      // Check if result is a string (simple response) or object with statusCode
      const statusCode =
        typeof result === 'string' ? 200 : (result as { statusCode?: number }).statusCode || 200;

      if (statusCode >= 200 && statusCode < 300) {
        try {
          await saveIdempotencyToken(
            userId,
            idempotencyKey,
            options.operation,
            result,
            requestId,
            options.ttlSeconds,
          );
        } catch (error) {
          // Log error but don't fail the request
          // The operation succeeded, we just couldn't cache it
          logger.error(
            'Failed to save idempotency token (operation succeeded)',
            error instanceof Error ? error : new Error(String(error)),
            {
              operation: 'withIdempotency',
              operationType: options.operation,
              userId,
              idempotencyKey,
              requestId,
            },
          );
        }
      } else {
        logger.debug('Not caching result (non-success status code)', {
          operation: 'withIdempotency',
          operationType: options.operation,
          userId,
          idempotencyKey,
          statusCode,
          requestId,
        });
      }

      return result;
    } catch (error) {
      logger.error(
        'Idempotency middleware error',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'withIdempotency',
          operationType: options.operation,
          requestId,
        },
      );

      // On middleware error, try to execute handler anyway
      // This ensures the system degrades gracefully
      return handler(event);
    }
  };
}

/**
 * Type guard to check if value is a valid APIGatewayProxyResultV2
 */
function isValidProxyResult(value: unknown): value is APIGatewayProxyResultV2 {
  if (typeof value === 'string') {
    return true; // Simple string response is valid
  }
  return (
    typeof value === 'object' &&
    value !== null &&
    'statusCode' in value &&
    typeof (value as { statusCode: unknown }).statusCode === 'number'
  );
}

/**
 * Helper function to create an idempotent handler with default options
 * Useful for common patterns like POST operations
 *
 * @param operation - Operation identifier
 * @param handler - Handler function
 * @returns Wrapped handler with idempotency
 *
 * @example
 * ```typescript
 * export const handler = createIdempotentHandler('cards_create', async (event) => {
 *   // Your handler logic
 * });
 * ```
 */
export function createIdempotentHandler(
  operation: string,
  handler: IdempotentHandler,
): IdempotentHandler {
  return withIdempotency(handler, { operation });
}
