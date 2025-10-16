# API Gateway HTTP API for CollectIQ Backend
# Provides authenticated REST API endpoints for card management

resource "aws_apigatewayv2_api" "collectiq_api" {
  name          = "${var.stage}-collectiq-api"
  protocol_type = "HTTP"
  description   = "CollectIQ Backend API - Card management, upload, and valuation"

  cors_configuration {
    allow_origins     = var.cors_allowed_origins
    allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers     = ["Content-Type", "Authorization", "X-Amz-Date", "X-Api-Key", "X-Amz-Security-Token", "X-Idempotency-Key"]
    expose_headers    = ["Content-Length", "Content-Type", "X-Request-Id"]
    max_age           = 300
    allow_credentials = true
  }

  tags = var.tags
}

# JWT Authorizer using Cognito User Pool
resource "aws_apigatewayv2_authorizer" "cognito_jwt" {
  api_id           = aws_apigatewayv2_api.collectiq_api.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${var.stage}-cognito-authorizer"

  jwt_configuration {
    audience = [var.cognito_client_id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${var.cognito_user_pool_id}"
  }
}

# API Gateway Stage
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.collectiq_api.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_logs.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
      errorMessage   = "$context.error.message"
      integrationErrorMessage = "$context.integrationErrorMessage"
    })
  }

  default_route_settings {
    throttling_burst_limit = var.throttling_burst_limit
    throttling_rate_limit  = var.throttling_rate_limit
  }

  tags = var.tags
}

# Response Headers for Security
# Note: API Gateway v2 HTTP APIs handle security headers through Lambda responses
# Each Lambda handler should include these headers in their responses:
# - Strict-Transport-Security: max-age=31536000; includeSubDomains
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
# - X-XSS-Protection: 1; mode=block
# - Content-Security-Policy: default-src 'self'

# CloudWatch Log Group for API Gateway logs
resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/apigateway/${var.stage}-collectiq-api"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

# ============================================================================
# ROUTE: POST /upload/presign
# ============================================================================
resource "aws_apigatewayv2_integration" "upload_presign" {
  api_id           = aws_apigatewayv2_api.collectiq_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = var.lambda_upload_presign_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "upload_presign" {
  api_id             = aws_apigatewayv2_api.collectiq_api.id
  route_key          = "POST /upload/presign"
  target             = "integrations/${aws_apigatewayv2_integration.upload_presign.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito_jwt.id
}

resource "aws_lambda_permission" "upload_presign" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_upload_presign_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.collectiq_api.execution_arn}/*/*"
}

# ============================================================================
# ROUTE: POST /cards
# ============================================================================
resource "aws_apigatewayv2_integration" "cards_create" {
  api_id           = aws_apigatewayv2_api.collectiq_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = var.lambda_cards_create_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "cards_create" {
  api_id             = aws_apigatewayv2_api.collectiq_api.id
  route_key          = "POST /cards"
  target             = "integrations/${aws_apigatewayv2_integration.cards_create.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito_jwt.id
}

resource "aws_lambda_permission" "cards_create" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_cards_create_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.collectiq_api.execution_arn}/*/*"
}

# ============================================================================
# ROUTE: GET /cards
# ============================================================================
resource "aws_apigatewayv2_integration" "cards_list" {
  api_id           = aws_apigatewayv2_api.collectiq_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = var.lambda_cards_list_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "cards_list" {
  api_id             = aws_apigatewayv2_api.collectiq_api.id
  route_key          = "GET /cards"
  target             = "integrations/${aws_apigatewayv2_integration.cards_list.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito_jwt.id
}

resource "aws_lambda_permission" "cards_list" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_cards_list_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.collectiq_api.execution_arn}/*/*"
}

# ============================================================================
# ROUTE: GET /cards/{id}
# ============================================================================
resource "aws_apigatewayv2_integration" "cards_get" {
  api_id           = aws_apigatewayv2_api.collectiq_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = var.lambda_cards_get_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "cards_get" {
  api_id             = aws_apigatewayv2_api.collectiq_api.id
  route_key          = "GET /cards/{id}"
  target             = "integrations/${aws_apigatewayv2_integration.cards_get.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito_jwt.id
}

resource "aws_lambda_permission" "cards_get" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_cards_get_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.collectiq_api.execution_arn}/*/*"
}

# ============================================================================
# ROUTE: DELETE /cards/{id}
# ============================================================================
resource "aws_apigatewayv2_integration" "cards_delete" {
  api_id           = aws_apigatewayv2_api.collectiq_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = var.lambda_cards_delete_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "cards_delete" {
  api_id             = aws_apigatewayv2_api.collectiq_api.id
  route_key          = "DELETE /cards/{id}"
  target             = "integrations/${aws_apigatewayv2_integration.cards_delete.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito_jwt.id
}

resource "aws_lambda_permission" "cards_delete" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_cards_delete_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.collectiq_api.execution_arn}/*/*"
}

# ============================================================================
# ROUTE: POST /cards/{id}/revalue
# ============================================================================
resource "aws_apigatewayv2_integration" "cards_revalue" {
  api_id           = aws_apigatewayv2_api.collectiq_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = var.lambda_cards_revalue_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "cards_revalue" {
  api_id             = aws_apigatewayv2_api.collectiq_api.id
  route_key          = "POST /cards/{id}/revalue"
  target             = "integrations/${aws_apigatewayv2_integration.cards_revalue.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito_jwt.id
}

resource "aws_lambda_permission" "cards_revalue" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_cards_revalue_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.collectiq_api.execution_arn}/*/*"
}

# ============================================================================
# ROUTE: GET /healthz (NO AUTH)
# ============================================================================
resource "aws_apigatewayv2_integration" "healthz" {
  api_id           = aws_apigatewayv2_api.collectiq_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = var.lambda_healthz_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "healthz" {
  api_id             = aws_apigatewayv2_api.collectiq_api.id
  route_key          = "GET /healthz"
  target             = "integrations/${aws_apigatewayv2_integration.healthz.id}"
  authorization_type = "NONE"
}

resource "aws_lambda_permission" "healthz" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_healthz_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.collectiq_api.execution_arn}/*/*"
}

# Custom domain configuration (optional)
resource "aws_apigatewayv2_domain_name" "api_domain" {
  count       = var.custom_domain_name != "" ? 1 : 0
  domain_name = var.custom_domain_name

  domain_name_configuration {
    certificate_arn = var.certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }

  tags = var.tags
}

resource "aws_apigatewayv2_api_mapping" "api_mapping" {
  count       = var.custom_domain_name != "" ? 1 : 0
  api_id      = aws_apigatewayv2_api.collectiq_api.id
  domain_name = aws_apigatewayv2_domain_name.api_domain[0].id
  stage       = aws_apigatewayv2_stage.default.id
}
