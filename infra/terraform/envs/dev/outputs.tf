# Outputs for dev environment
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

# Placeholder for future module outputs:
# - Amplify app ID and domain
# - Cognito user pool ID, client ID, domain
# - API Gateway endpoint
# - DynamoDB table name
# - S3 bucket names
# - Lambda function ARNs
# - Step Functions state machine ARN
# - EventBridge bus name
