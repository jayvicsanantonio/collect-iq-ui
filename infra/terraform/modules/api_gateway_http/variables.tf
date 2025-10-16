# API Gateway HTTP Module Variables

variable "stage" {
  description = "Deployment stage (dev, staging, prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

# Cognito Configuration
variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID for JWT authorizer"
  type        = string
}

variable "cognito_client_id" {
  description = "Cognito User Pool Client ID"
  type        = string
}

# CORS Configuration
variable "cors_allowed_origins" {
  description = "List of allowed origins for CORS"
  type        = list(string)
  default     = ["http://localhost:3000"]
}

# Throttling Configuration
variable "throttling_burst_limit" {
  description = "API Gateway throttling burst limit"
  type        = number
  default     = 5000
}

variable "throttling_rate_limit" {
  description = "API Gateway throttling rate limit (requests per second)"
  type        = number
  default     = 2000
}

# Logging Configuration
variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

# Lambda Function ARNs - Upload
variable "lambda_upload_presign_invoke_arn" {
  description = "Invoke ARN for upload_presign Lambda function"
  type        = string
}

variable "lambda_upload_presign_function_name" {
  description = "Function name for upload_presign Lambda"
  type        = string
}

# Lambda Function ARNs - Cards Create
variable "lambda_cards_create_invoke_arn" {
  description = "Invoke ARN for cards_create Lambda function"
  type        = string
}

variable "lambda_cards_create_function_name" {
  description = "Function name for cards_create Lambda"
  type        = string
}

# Lambda Function ARNs - Cards List
variable "lambda_cards_list_invoke_arn" {
  description = "Invoke ARN for cards_list Lambda function"
  type        = string
}

variable "lambda_cards_list_function_name" {
  description = "Function name for cards_list Lambda"
  type        = string
}

# Lambda Function ARNs - Cards Get
variable "lambda_cards_get_invoke_arn" {
  description = "Invoke ARN for cards_get Lambda function"
  type        = string
}

variable "lambda_cards_get_function_name" {
  description = "Function name for cards_get Lambda"
  type        = string
}

# Lambda Function ARNs - Cards Delete
variable "lambda_cards_delete_invoke_arn" {
  description = "Invoke ARN for cards_delete Lambda function"
  type        = string
}

variable "lambda_cards_delete_function_name" {
  description = "Function name for cards_delete Lambda"
  type        = string
}

# Lambda Function ARNs - Cards Revalue
variable "lambda_cards_revalue_invoke_arn" {
  description = "Invoke ARN for cards_revalue Lambda function"
  type        = string
}

variable "lambda_cards_revalue_function_name" {
  description = "Function name for cards_revalue Lambda"
  type        = string
}

# Lambda Function ARNs - Healthz
variable "lambda_healthz_invoke_arn" {
  description = "Invoke ARN for healthz Lambda function"
  type        = string
}

variable "lambda_healthz_function_name" {
  description = "Function name for healthz Lambda"
  type        = string
}

# Custom Domain (Optional)
variable "custom_domain_name" {
  description = "Custom domain name for API Gateway (optional)"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ACM certificate ARN for custom domain (required if custom_domain_name is set)"
  type        = string
  default     = ""
}

# Tags
variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
