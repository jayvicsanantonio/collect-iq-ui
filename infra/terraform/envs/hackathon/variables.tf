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
}
