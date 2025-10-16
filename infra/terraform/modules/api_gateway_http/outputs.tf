# API Gateway HTTP Module Outputs

output "api_id" {
  description = "API Gateway HTTP API ID"
  value       = aws_apigatewayv2_api.collectiq_api.id
}

output "api_endpoint" {
  description = "API Gateway HTTP API endpoint URL"
  value       = aws_apigatewayv2_api.collectiq_api.api_endpoint
}

output "api_execution_arn" {
  description = "API Gateway execution ARN for Lambda permissions"
  value       = aws_apigatewayv2_api.collectiq_api.execution_arn
}

output "stage_invoke_url" {
  description = "API Gateway stage invoke URL"
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "authorizer_id" {
  description = "JWT authorizer ID"
  value       = aws_apigatewayv2_authorizer.cognito_jwt.id
}

output "custom_domain_name" {
  description = "Custom domain name (if configured)"
  value       = var.custom_domain_name != "" ? aws_apigatewayv2_domain_name.api_domain[0].domain_name : ""
}

output "cloudwatch_log_group_name" {
  description = "CloudWatch log group name for API Gateway logs"
  value       = aws_cloudwatch_log_group.api_logs.name
}

output "cloudwatch_log_group_arn" {
  description = "CloudWatch log group ARN for API Gateway logs"
  value       = aws_cloudwatch_log_group.api_logs.arn
}
