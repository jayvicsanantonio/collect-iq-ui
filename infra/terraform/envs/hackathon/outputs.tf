# Outputs for hackathon environment
# These outputs will be used by frontend and backend applications

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "account_id" {
  description = "AWS Account ID"
  value       = data.aws_caller_identity.current.account_id
}

output "name_prefix" {
  description = "Resource name prefix"
  value       = local.name_prefix
}

# Placeholder for future module outputs:
#
# Backend outputs:
# output "api_base_url" {
#   description = "API Gateway base URL"
#   value       = module.api_gateway_http.api_endpoint
# }
#
# output "dynamodb_table_name" {
#   description = "DynamoDB table name"
#   value       = module.dynamodb_collectiq.table_name
# }
#
# output "s3_uploads_bucket" {
#   description = "S3 uploads bucket name"
#   value       = module.s3_uploads.bucket_name
# }
#
# output "step_functions_arn" {
#   description = "Step Functions state machine ARN"
#   value       = module.step_functions.state_machine_arn
# }
#
# output "eventbridge_bus_name" {
#   description = "EventBridge bus name"
#   value       = module.eventbridge_bus.bus_name
# }
#
# Frontend outputs:
# output "amplify_app_id" {
#   description = "Amplify app ID"
#   value       = module.amplify_hosting.app_id
# }
#
# output "amplify_default_domain" {
#   description = "Amplify default domain"
#   value       = module.amplify_hosting.default_domain
# }
#
# output "cognito_user_pool_id" {
#   description = "Cognito user pool ID"
#   value       = module.cognito_user_pool.user_pool_id
# }
#
# output "cognito_client_id" {
#   description = "Cognito app client ID"
#   value       = module.cognito_user_pool.client_id
# }
#
# output "cognito_hosted_ui_domain" {
#   description = "Cognito Hosted UI domain"
#   value       = module.cognito_user_pool.hosted_ui_domain
# }
