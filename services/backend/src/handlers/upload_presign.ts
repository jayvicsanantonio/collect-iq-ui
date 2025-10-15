/**
 * Upload Presign Handler
 * Generates secure, time-limited S3 presigned URLs for card image uploads
 */

import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { PresignRequestSchema, type PresignResponse } from '@collectiq/shared';
import { getUserId, type APIGatewayProxyEventV2WithJWT } from '../auth/jwt-claims.js';
import { logger } from '../utils/logger.js';
import { formatErrorResponse, BadRequestError, PayloadTooLargeError } from '../utils/errors.js';
import {
  validate,
  sanitizeFilename,
  validateMimeType,
  validateFileSize,
  getEnvVar,
  getEnvArray,
  getEnvNumber,
} from '../utils/validation.js';

// Initialize S3 client
const s3Client = new S3Client({});

// Constants
const PRESIGN_EXPIRATION_SECONDS = 60;

/**
 * Get environment configuration
 * Lazy-loaded to avoid errors during module import in tests
 */
function getConfig() {
  return {
    BUCKET_UPLOADS: getEnvVar('BUCKET_UPLOADS'),
    ALLOWED_UPLOAD_MIME: getEnvArray('ALLOWED_UPLOAD_MIME', [
      'image/jpeg',
      'image/png',
      'image/heic',
    ]),
    MAX_UPLOAD_MB: getEnvNumber('MAX_UPLOAD_MB', 12),
    KMS_KEY_ID: process.env.KMS_KEY_ID, // Optional: for SSE-KMS
  };
}

/**
 * Lambda handler for generating presigned upload URLs
 */
export async function handler(
  event: APIGatewayProxyEventV2WithJWT,
): Promise<APIGatewayProxyResultV2> {
  const requestId = event.requestContext.requestId;

  try {
    // Get configuration
    const config = getConfig();

    // Extract user ID from JWT claims
    const userId = getUserId(event);

    logger.info('Processing presign request', {
      requestId,
      userId,
      operation: 'upload_presign',
    });

    // Parse and validate request body
    const body = event.body ? JSON.parse(event.body) : {};
    const request = validate(PresignRequestSchema, body);

    // Validate MIME type
    if (!validateMimeType(request.contentType, config.ALLOWED_UPLOAD_MIME)) {
      throw new BadRequestError(
        `Invalid content type. Allowed types: ${config.ALLOWED_UPLOAD_MIME.join(', ')}`,
        requestId,
        {
          contentType: request.contentType,
          allowedTypes: config.ALLOWED_UPLOAD_MIME,
        },
      );
    }

    // Validate file size
    if (!validateFileSize(request.sizeBytes, config.MAX_UPLOAD_MB)) {
      throw new PayloadTooLargeError(
        `File size exceeds maximum allowed size of ${config.MAX_UPLOAD_MB}MB`,
        requestId,
        {
          sizeBytes: request.sizeBytes,
          maxBytes: config.MAX_UPLOAD_MB * 1024 * 1024,
        },
      );
    }

    // Generate S3 key: uploads/{sub}/{uuid}-{sanitizedFilename}
    const fileUuid = uuidv4();
    const sanitized = sanitizeFilename(request.filename);
    const s3Key = `uploads/${userId}/${fileUuid}_${sanitized}`;

    logger.debug('Generated S3 key', {
      requestId,
      userId,
      s3Key,
      originalFilename: request.filename,
    });

    // Create PutObject command with encryption headers
    const command = new PutObjectCommand({
      Bucket: config.BUCKET_UPLOADS,
      Key: s3Key,
      ContentType: request.contentType,
      ContentLength: request.sizeBytes,
      // Server-side encryption
      ...(config.KMS_KEY_ID
        ? {
            ServerSideEncryption: 'aws:kms',
            SSEKMSKeyId: config.KMS_KEY_ID,
          }
        : {
            ServerSideEncryption: 'AES256',
          }),
      // Metadata for tracking
      Metadata: {
        'uploaded-by': userId,
        'original-filename': request.filename,
      },
    });

    // Generate presigned URL
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: PRESIGN_EXPIRATION_SECONDS,
    });

    const response: PresignResponse = {
      uploadUrl,
      key: s3Key,
      expiresIn: PRESIGN_EXPIRATION_SECONDS,
    };

    logger.info('Presigned URL generated successfully', {
      requestId,
      userId,
      s3Key,
      expiresIn: PRESIGN_EXPIRATION_SECONDS,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    logger.error('Failed to generate presigned URL', error as Error, {
      requestId,
      operation: 'upload_presign',
    });

    return formatErrorResponse(error, requestId);
  }
}
