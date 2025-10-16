# Hackathon Environment

This directory contains the Terraform configuration for the CollectIQ hackathon environment.

## Prerequisites

1. **AWS Account**: Ensure you have AWS credentials configured
2. **Terraform**: Version >= 1.1.7
3. **State Backend**: S3 bucket and DynamoDB table must be created first

## Initial Setup

### 1. Create State Backend (One-time setup)

Before initializing this environment, you must create the S3 bucket and DynamoDB table for state management:

```bash
cd ../../prereq
terraform init
terraform plan
terraform apply
```

This creates:

- S3 bucket: `collectiq-tfstate` (with versioning enabled)
- DynamoDB table: `collectiq-terraform-locks`

### 2. Configure Variables

Copy the example tfvars file and update with your values:

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your configuration
```

### 3. Initialize Terraform

Initialize the Terraform backend and download providers:

```bash
terraform init
```

### 4. Plan and Apply

Review the infrastructure changes:

```bash
terraform plan
```

Apply the configuration:

```bash
terraform apply
```

## Configuration

### Variables

- `aws_region`: AWS region (default: us-east-1)
- `environment`: Environment name (default: hackathon)
- `project_name`: Project name for resource naming (default: collectiq)
- `github_repo_url`: GitHub repository URL for Amplify
- `budget_amount`: Monthly budget in USD (default: $50)
- `lambda_memory_lightweight`: Memory for lightweight Lambdas (default: 512MB)
- `lambda_memory_heavy`: Memory for heavy processing Lambdas (default: 1024MB)
- `log_level`: Log level for Lambda functions (default: info)

### Outputs

After applying, Terraform will output:

- AWS region and account ID
- Resource name prefix
- (Future) API Gateway endpoint, Cognito IDs, S3 buckets, etc.

## Resource Naming Convention

All resources are prefixed with: `collectiq-hackathon-`

## Cost Optimization

The hackathon environment is configured for cost efficiency:

- Lambda memory: 512MB for lightweight, 1024MB for heavy processing
- DynamoDB: On-demand billing
- S3: Lifecycle policies for archival
- Budget alerts at $50/month

## Modules

Infrastructure is organized into reusable modules:

- `amplify_hosting`: Next.js frontend deployment
- `cognito_user_pool`: User authentication
- `api_gateway_http`: HTTP API with JWT authorizer
- `dynamodb_collectiq`: Single-table design
- `s3_uploads`: Secure image storage
- `lambda_fn`: Lambda function deployment
- `step_functions`: Multi-agent orchestration
- `eventbridge_bus`: Domain events
- `rekognition_access`: IAM policies for Rekognition
- `bedrock_access`: IAM policies for Bedrock
- `cloudwatch_dashboards`: Monitoring
- `ssm_secrets`: External API keys

## State Management

- **Backend**: S3 with DynamoDB locking
- **State file**: `s3://collectiq-tfstate/hackathon/terraform.tfstate`
- **Lock table**: `collectiq-terraform-locks`
- **Encryption**: Enabled
- **Versioning**: Enabled for state recovery

## Common Commands

```bash
# Initialize backend
terraform init

# Validate configuration
terraform validate

# Format code
terraform fmt -recursive

# Plan changes
terraform plan

# Apply changes
terraform apply

# Show current state
terraform show

# List resources
terraform state list

# Destroy all resources (use with caution!)
terraform destroy
```

## Troubleshooting

### Backend initialization fails

Ensure the prereq resources are created:

```bash
cd ../../prereq
terraform apply
```

### State lock errors

If state is locked, you can force unlock (use with caution):

```bash
terraform force-unlock <LOCK_ID>
```

### Permission errors

Ensure your AWS credentials have sufficient permissions for all resources.
