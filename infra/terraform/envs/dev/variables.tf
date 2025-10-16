# Variables for dev environment

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "collectiq"
}

variable "custom_domain" {
  description = "Custom domain for the application"
  type        = string
  default     = "dev.collectiq.com"
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
