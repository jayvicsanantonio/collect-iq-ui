# Main Terraform configuration for hackathon environment
# This file will import and configure all infrastructure modules

# Data source to get current AWS account ID
data "aws_caller_identity" "current" {}

# Local variables for resource naming and configuration
locals {
  account_id  = data.aws_caller_identity.current.account_id
  name_prefix = "${var.project_name}-${var.environment}"
  
  # Common tags for all resources
  common_tags = {
    Project     = "CollectIQ"
    Environment = var.environment
    Owner       = "DevOps"
    ManagedBy   = "Terraform"
    CostCenter  = "Engineering"
  }
}

# Placeholder for future module imports
# Modules will be added as they are created:
# 
# module "amplify_hosting" {
#   source = "../../modules/amplify_hosting"
#   ...
# }
#
# module "cognito_user_pool" {
#   source = "../../modules/cognito_user_pool"
#   ...
# }
#
# module "api_gateway_http" {
#   source = "../../modules/api_gateway_http"
#   ...
# }
#
# module "dynamodb_collectiq" {
#   source = "../../modules/dynamodb_collectiq"
#   ...
# }
#
# module "s3_uploads" {
#   source = "../../modules/s3_uploads"
#   ...
# }
#
# module "lambda_fn" {
#   source = "../../modules/lambda_fn"
#   ...
# }
#
# module "step_functions" {
#   source = "../../modules/step_functions"
#   ...
# }
#
# module "eventbridge_bus" {
#   source = "../../modules/eventbridge_bus"
#   ...
# }
#
# module "rekognition_access" {
#   source = "../../modules/rekognition_access"
#   ...
# }
#
# module "bedrock_access" {
#   source = "../../modules/bedrock_access"
#   ...
# }
#
# module "cloudwatch_dashboards" {
#   source = "../../modules/cloudwatch_dashboards"
#   ...
# }
#
# module "ssm_secrets" {
#   source = "../../modules/ssm_secrets"
#   ...
# }
