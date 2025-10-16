# API Gateway HTTP Module

This Terraform module creates an AWS API Gateway HTTP API with JWT authentication for the CollectIQ backend.

## Features

- **HTTP API**: Modern API Gateway v2 with lower latency and cost
- **JWT Authorization**: Cognito User Pool integration with automatic token validation
- **CORS Configuration**: Configurable CORS with credentials support
- **Security Headers**: HSTS and X-Content-Type-Options enforcement
- **Throttling**: Configurable rate limiting and burst protection
- **Logging**: CloudWatch integration with structured JSON logs
- **Custom Domain**: Optional custom domain with ACM certificate

## Routes

All routes except `/healthz` require a valid JWT token in the `Authorization` header.

| Method | Path                  | Handler        | Auth Required |
| ------ | --------------------- | -------------- | ------------- |
| POST   | `/upload/presign`     | upload_presign | ✅            |
| POST   | `/cards`              | cards_create   | ✅            |
| GET    | `/cards`              | cards_list     | ✅            |
| GET    | `/cards/{id}`         | cards_get      | ✅            |
| DELETE | `/cards/{id}`         | cards_delete   | ✅            |
| POST   | `/cards/{id}/revalue` | cards_revalue  | ✅            |
| GET    | `/healthz`            | healthz        | ❌            |

## Usage

```hcl
module "api_gateway" {
  source = "../modules/api_gateway_http"

  stage     = "dev"
  aws_region = "us-east-1"

  # Cognito Configuration
  cognito_user_pool_id = module.cognito.user_pool_id
  cognito_client_id    = module.cognito.client_id

  # CORS Configuration
  cors_allowed_origins = [
    "http://localhost:3000",
    "https://dev.collectiq.app"
  ]

  # Lambda Functions
  lambda_upload_presign_invoke_arn    = module.lambda_upload_presign.invoke_arn
  lambda_upload_presign_function_name = module.lambda_upload_presign.function_name

  lambda_cards_create_invoke_arn      = module.lambda_cards_create.invoke_arn
  lambda_cards_create_function_name   = module.lambda_cards_create.function_name

  lambda_cards_list_invoke_arn        = module.lambda_cards_list.invoke_arn
  lambda_cards_list_function_name     = module.lambda_cards_list.function_name

  lambda_cards_get_invoke_arn         = module.lambda_cards_get.invoke_arn
  lambda_cards_get_function_name      = module.lambda_cards_get.function_name

  lambda_cards_delete_invoke_arn      = module.lambda_cards_delete.invoke_arn
  lambda_cards_delete_function_name   = module.lambda_cards_delete.function_name

  lambda_cards_revalue_invoke_arn     = module.lambda_cards_revalue.invoke_arn
  lambda_cards_revalue_function_name  = module.lambda_cards_revalue.function_name

  lambda_healthz_invoke_arn           = module.lambda_healthz.invoke_arn
  lambda_healthz_function_name        = module.lambda_healthz.function_name

  # Optional: Custom Domain
  custom_domain_name = "api.collectiq.app"
  certificate_arn    = "arn:aws:acm:us-east-1:123456789012:certificate/..."

  tags = {
    Environment = "dev"
    Project     = "CollectIQ"
    ManagedBy   = "Terraform"
  }
}
```

## Outputs

- `api_endpoint`: Base URL for the API Gateway
- `stage_invoke_url`: Full invoke URL including stage
- `api_id`: API Gateway ID for reference
- `authorizer_id`: JWT authorizer ID
- `cloudwatch_log_group_name`: Log group name for monitoring

## Security

### JWT Token Validation

The JWT authorizer validates tokens against the Cognito User Pool JWKS endpoint:

- Verifies token signature
- Checks token expiration
- Validates audience (client ID)
- Validates issuer (Cognito User Pool)

### CORS Policy

CORS is configured to:

- Allow credentials (cookies, authorization headers)
- Restrict origins to configured domains
- Allow standard HTTP methods
- Expose necessary response headers
- Cache preflight responses for 5 minutes

### Security Headers

The API Gateway enforces:

- **HSTS**: Strict-Transport-Security header for HTTPS enforcement
- **X-Content-Type-Options**: nosniff to prevent MIME type sniffing
- **TLS 1.2+**: Minimum TLS version for custom domains

### Throttling

Default throttling limits:

- Burst: 5000 requests
- Rate: 2000 requests/second

Adjust these based on your expected traffic patterns.

## Monitoring

### CloudWatch Logs

API Gateway logs include:

- Request ID for tracing
- Source IP address
- Request time and method
- Route key and status code
- Response length
- Error messages

### Metrics

Monitor these CloudWatch metrics:

- `4XXError`: Client errors (auth failures, validation errors)
- `5XXError`: Server errors (Lambda failures, timeouts)
- `Count`: Total request count
- `IntegrationLatency`: Lambda execution time
- `Latency`: Total request latency

### Alarms

Recommended CloudWatch alarms:

- 4XX error rate > 5% for 5 minutes
- 5XX error rate > 1% for 5 minutes
- P95 latency > 1000ms for 5 minutes
- Throttled requests > 100 for 5 minutes

## Requirements

| Name      | Version   |
| --------- | --------- |
| terraform | >= 1.1.7  |
| aws       | >= 6.16.0 |

## Providers

| Name | Version   |
| ---- | --------- |
| aws  | >= 6.16.0 |

## Resources Created

- `aws_apigatewayv2_api`: HTTP API
- `aws_apigatewayv2_authorizer`: JWT authorizer
- `aws_apigatewayv2_stage`: Default stage with auto-deploy
- `aws_apigatewayv2_integration`: Lambda integrations (7 total)
- `aws_apigatewayv2_route`: API routes (7 total)
- `aws_lambda_permission`: Lambda invoke permissions (7 total)
- `aws_cloudwatch_log_group`: API Gateway logs
- `aws_apigatewayv2_domain_name`: Custom domain (optional)
- `aws_apigatewayv2_api_mapping`: Domain mapping (optional)

## Notes

- The `/healthz` endpoint is intentionally unauthenticated for health checks
- All other routes require a valid JWT token from Cognito
- Lambda permissions are scoped to allow invocation from any route
- The API uses payload format version 2.0 for better Lambda integration
- Auto-deploy is enabled for the default stage
