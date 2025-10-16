# Variables for hackathon environment

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (hackathon)"
  type        = string
  default     = "hackathon"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "collectiq"
}

variable "github_repo_url" {
  description = "GitHub repository URL for Amplify"
  type        = string
  default     = ""
}

variable "budget_amount" {
  description = "Monthly budget amount in USD"
  type        = number
  default     = 50
}

variable "lambda_memory_lightweight" {
  description = "Memory allocation for lightweight Lambda functions (MB)"
  type        = number
  default     = 512
}

variable "lambda_memory_heavy" {
  description = "Memory allocation for heavy processing Lambda functions (MB)"
  type        = number
  default     = 1024
}

variable "log_level" {
  description = "Log level for Lambda functions"
  type        = string
  default     = "info"

  validation {
    condition     = contains(["debug", "info", "warn", "error"], var.log_level)
    error_message = "Log level must be one of: debug, info, warn, error"
  }
}

variable "budget_email_addresses" {
  description = "Email addresses for budget alerts"
  type        = list(string)
  default     = []
}

variable "enable_xray_tracing" {
  description = "Enable X-Ray tracing for Lambda and Step Functions"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}
