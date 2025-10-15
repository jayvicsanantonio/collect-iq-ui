/**
 * Cards Get Handler
 * GET /cards/{id} - Get a specific card by ID
 */

import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getUserId, type APIGatewayProxyEventV2WithJWT } from '../auth/jwt-claims.js';
import { getCard } from '../store/card-service.js';
import { formatErrorResponse, BadRequestError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Lambda handler for getting a specific card
 *
 * @param event - API Gateway event with JWT claims
 * @returns 200 OK with card object or 404 if not found
 */
export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const requestId = event.requestContext.requestId;

  try {
    // Extract user ID from JWT claims
    const userId = getUserId(event as APIGatewayProxyEventV2WithJWT);

    // Extract cardId from path parameters
    const cardId = event.pathParameters?.id;

    if (!cardId) {
      throw new BadRequestError('Card ID is required in path', requestId);
    }

    logger.info('Processing get card request', {
      operation: 'cards_get',
      userId,
      cardId,
      requestId,
    });

    // Get card from DynamoDB (includes ownership verification)
    const card = await getCard(userId, cardId, requestId);

    logger.info('Card retrieved successfully', {
      operation: 'cards_get',
      userId,
      cardId,
      requestId,
    });

    // Return 200 OK with card object
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(card),
    };
  } catch (error) {
    logger.error('Failed to get card', error instanceof Error ? error : new Error(String(error)), {
      operation: 'cards_get',
      requestId,
    });

    return formatErrorResponse(error, requestId);
  }
}
