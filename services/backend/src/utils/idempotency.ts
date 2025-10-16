/**
 * Idempotency Token Storage
 * Provides utilities for storing and retrieving idempotency tokens in DynamoDB
 * to prevent duplicate operations within a TTL window
 */

import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import {
  getDynamoDBClient,
  getTableName,
  generateUserPK,
  calculateTTL,
} from '../store/dynamodb-client.js';
import { logger } from './logger.js';
import { ConflictError } from './errors.js';

/**
 * Default TTL for idempotency tokens (10 minutes)
 */
const DEFAULT_IDEMPOTENCY_TTL_SECONDS = 600;

/**
 * Idempotency token item structure in DynamoDB
 */
interface IdempotencyTokenItem {
  PK: string; // USER#{userId}
  SK: string; // IDEMPOTENCY#{idempotencyKey}
  entityType: 'IDEMPOTENCY';
  idempotencyKey: string;
  userId: string;
  operation: string;
  result: unknown; // Cached operation result
  createdAt: string;
  ttl: number; // Unix timestamp for auto-deletion
}

/**
 * Generate sort key for idempotency token
 *
 * @param idempotencyKey - Idempotency key from request
 * @returns Sort key in format IDEMPOTENCY#{key}
 */
function generateIdempotencySK(idempotencyKey: string): string {
  if (!idempotencyKey) {
    throw new Error('idempotencyKey is required for SK generation');
  }
  return `IDEMPOTENCY#${idempotencyKey}`;
}

/**
 * Save an idempotency token with operation result
 * Uses conditional write to prevent race conditions
 *
 * @param userId - Cognito user ID
 * @param idempotencyKey - Unique idempotency key from request
 * @param operation - Operation identifier (e.g., 'cards_create', 'cards_revalue')
 * @param result - Operation result to cache
 * @param requestId - Request ID for logging
 * @param ttlSeconds - TTL in seconds (default: 600)
 * @throws ConflictError if token already exists (race condition detected)
 */
export async function saveIdempotencyToken(
  userId: string,
  idempotencyKey: string,
  operation: string,
  result: unknown,
  requestId?: string,
  ttlSeconds?: number,
): Promise<void> {
  const ttl =
    ttlSeconds || Number(process.env.IDEMPOTENCY_TTL_SECONDS) || DEFAULT_IDEMPOTENCY_TTL_SECONDS;
  const now = new Date().toISOString();

  const item: IdempotencyTokenItem = {
    PK: generateUserPK(userId),
    SK: generateIdempotencySK(idempotencyKey),
    entityType: 'IDEMPOTENCY',
    idempotencyKey,
    userId,
    operation,
    result,
    createdAt: now,
    ttl: calculateTTL(ttl),
  };

  logger.debug('Saving idempotency token', {
    operation: 'saveIdempotencyToken',
    userId,
    idempotencyKey,
    operationType: operation,
    ttl,
    requestId,
  });

  try {
    const client = getDynamoDBClient();
    const tableName = getTableName();

    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: item,
        // Conditional write: fail if item already exists
        // This prevents race conditions when multiple requests arrive simultaneously
        ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
      }),
    );

    logger.info('Idempotency token saved successfully', {
      operation: 'saveIdempotencyToken',
      userId,
      idempotencyKey,
      operationType: operation,
      requestId,
    });
  } catch (err) {
    if (
      err &&
      typeof err === 'object' &&
      'name' in err &&
      err.name === 'ConditionalCheckFailedException'
    ) {
      // Token already exists - this is a duplicate request
      logger.warn('Idempotency token already exists (duplicate request detected)', {
        operation: 'saveIdempotencyToken',
        userId,
        idempotencyKey,
        operationType: operation,
        requestId,
      });
      throw new ConflictError(
        'Duplicate request detected - operation already in progress or completed',
        requestId || '',
        { userId, idempotencyKey, operation },
      );
    }
    // Re-throw other errors
    logger.error(
      'Failed to save idempotency token',
      err instanceof Error ? err : new Error(String(err)),
      {
        operation: 'saveIdempotencyToken',
        userId,
        idempotencyKey,
        operationType: operation,
        requestId,
      },
    );
    throw err;
  }
}

/**
 * Retrieve an idempotency token and its cached result
 *
 * @param userId - Cognito user ID
 * @param idempotencyKey - Unique idempotency key from request
 * @param requestId - Request ID for logging
 * @returns Cached operation result if token exists and not expired, null otherwise
 */
export async function getIdempotencyToken(
  userId: string,
  idempotencyKey: string,
  requestId?: string,
): Promise<unknown | null> {
  logger.debug('Retrieving idempotency token', {
    operation: 'getIdempotencyToken',
    userId,
    idempotencyKey,
    requestId,
  });

  try {
    const client = getDynamoDBClient();
    const tableName = getTableName();

    const result = await client.send(
      new GetCommand({
        TableName: tableName,
        Key: {
          PK: generateUserPK(userId),
          SK: generateIdempotencySK(idempotencyKey),
        },
        ConsistentRead: true, // Use consistent read to avoid stale data
      }),
    );

    if (!result.Item) {
      logger.debug('Idempotency token not found', {
        operation: 'getIdempotencyToken',
        userId,
        idempotencyKey,
        requestId,
      });
      return null;
    }

    const item = result.Item as IdempotencyTokenItem;

    // Verify entity type
    if (item.entityType !== 'IDEMPOTENCY') {
      logger.warn('Invalid entity type for idempotency token', {
        operation: 'getIdempotencyToken',
        userId,
        idempotencyKey,
        entityType: item.entityType,
        requestId,
      });
      return null;
    }

    // Check if token has expired (TTL not yet processed by DynamoDB)
    const now = Math.floor(Date.now() / 1000);
    if (item.ttl && item.ttl < now) {
      logger.debug('Idempotency token expired', {
        operation: 'getIdempotencyToken',
        userId,
        idempotencyKey,
        ttl: item.ttl,
        now,
        requestId,
      });
      return null;
    }

    logger.info('Idempotency token found (returning cached result)', {
      operation: 'getIdempotencyToken',
      userId,
      idempotencyKey,
      operationType: item.operation,
      createdAt: item.createdAt,
      requestId,
    });

    return item.result;
  } catch (error) {
    logger.error(
      'Failed to retrieve idempotency token',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'getIdempotencyToken',
        userId,
        idempotencyKey,
        requestId,
      },
    );
    // Return null on error to allow operation to proceed
    // This is safer than blocking the request
    return null;
  }
}

/**
 * Extract idempotency key from request headers
 * Supports both standard and custom header names
 *
 * @param headers - Request headers from API Gateway event
 * @returns Idempotency key if present, null otherwise
 */
export function extractIdempotencyKey(
  headers: Record<string, string | undefined> | undefined,
): string | null {
  if (!headers) {
    return null;
  }

  // Check standard Idempotency-Key header (case-insensitive)
  const standardKey =
    headers['idempotency-key'] || headers['Idempotency-Key'] || headers['IDEMPOTENCY-KEY'];

  if (standardKey) {
    return standardKey;
  }

  // Check custom X-Idempotency-Key header (case-insensitive)
  const customKey =
    headers['x-idempotency-key'] || headers['X-Idempotency-Key'] || headers['X-IDEMPOTENCY-KEY'];

  return customKey || null;
}
