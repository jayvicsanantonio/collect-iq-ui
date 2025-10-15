/**
 * Cards Create Handler
 * POST /cards - Create a new card record
 */

import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { CreateCardRequestSchema } from '@collectiq/shared';
import { getUserId, type APIGatewayProxyEventV2WithJWT } from '../auth/jwt-claims.js';
import { createCard } from '../store/card-service.js';
import { formatErrorResponse, BadRequestError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Lambda handler for creating a new card
 *
 * @param event - API Gateway event with JWT claims
 * @returns 201 Created with card object or error response
 */
export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const requestId = event.requestContext.requestId;

  try {
    // Extract user ID from JWT claims
    const userId = getUserId(event as APIGatewayProxyEventV2WithJWT);

    logger.info('Processing card creation request', {
      operation: 'cards_create',
      userId,
      requestId,
    });

    // Parse and validate request body
    if (!event.body) {
      throw new BadRequestError('Request body is required', requestId);
    }

    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch {
      throw new BadRequestError('Invalid JSON in request body', requestId);
    }

    // Validate with Zod schema
    const validationResult = CreateCardRequestSchema.safeParse(requestBody);
    if (!validationResult.success) {
      throw new BadRequestError(`Validation failed: ${validationResult.error.message}`, requestId, {
        errors: validationResult.error.errors,
      });
    }

    const cardData = validationResult.data;

    // Create card in DynamoDB
    const card = await createCard(userId, cardData, requestId);

    logger.info('Card created successfully', {
      operation: 'cards_create',
      userId,
      cardId: card.cardId,
      requestId,
    });

    // Return 201 Created with card object
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(card),
    };
  } catch (error) {
    logger.error(
      'Failed to create card',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'cards_create',
        requestId,
      },
    );

    return formatErrorResponse(error, requestId);
  }
}
