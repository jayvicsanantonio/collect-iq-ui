/**
 * Cards Delete Handler
 * DELETE /cards/{id} - Delete a specific card
 */

import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getUserId, type APIGatewayProxyEventV2WithJWT } from '../auth/jwt-claims.js';
import { deleteCard } from '../store/card-service.js';
import { formatErrorResponse, BadRequestError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Lambda handler for deleting a card
 *
 * @param event - API Gateway event with JWT claims
 * @returns 204 No Content on success or 404 if not found
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

    logger.info('Processing delete card request', {
      operation: 'cards_delete',
      userId,
      cardId,
      requestId,
    });

    // Delete card from DynamoDB (includes ownership verification)
    // Uses soft delete by default (can be configured via environment variable)
    const hardDelete = process.env.HARD_DELETE_CARDS === 'true';
    await deleteCard(userId, cardId, requestId, hardDelete);

    logger.info('Card deleted successfully', {
      operation: 'cards_delete',
      userId,
      cardId,
      hardDelete,
      requestId,
    });

    // Return 204 No Content
    return {
      statusCode: 204,
      headers: {},
      body: '',
    };
  } catch (error) {
    logger.error(
      'Failed to delete card',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'cards_delete',
        requestId,
      },
    );

    return formatErrorResponse(error, requestId);
  }
}
