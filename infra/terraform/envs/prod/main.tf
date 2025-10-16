# Main Terraform configuration for prod environment
# This file will import and configure all infrastructure modules

# Data source to get current AWS account ID
data "aws_caller_identity" "current" {}

# Placeholder for future module imports
# Modules will be added as they are created:
# - amplify_hosting
# - cognito_user_pool
# - api_gateway_http
# - dynamodb_collectiq
# - s3_uploads
# - lambda_fn
# - step_functions
# - eventbridge_bus
# - rekognition_access
# - bedrock_access
# - cloudwatch_dashboards
# - ssm_secrets

locals {
  account_id = data.aws_caller_identity.current.account_id
  name_prefix = "${var.project_name}-${var.environment}"
}
