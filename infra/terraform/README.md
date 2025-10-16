# CollectIQ Terraform Infrastructure

This directory contains all Terraform infrastructure-as-code for the CollectIQ platform.

## Directory Structure

```
terraform/
├── modules/           # Reusable Terraform modules
│   ├── amplify_hosting/
│   ├── api_gateway_http/
│   ├── cognito_user_pool/
│   ├── dynamodb_collectiq/
│   ├── s3_uploads/
│   ├── lambda_fn/
│   ├── step_functions/
│   ├── eventbridge_bus/
│   ├── rekognition_access/
│   ├── bedrock_access/
│   ├── cloudwatch_dashboards/
│   ├── ssm_secrets/
│   └── prereq/        # S3 + DynamoDB for state management
├── envs/              # Environment-specific configurations
│   ├── dev/           # Development environment
│   └── prod/          # Production environment
└── prereq/            # Bootstrap infrastructure (run first)
```

## Prerequisites

Before deploying infrastructure, you must create the S3 bucket and DynamoDB table for Terraform state management:

```bash
cd prereq
terraform init
terraform plan
terraform apply
```

This creates:

- S3 bucket: `collectiq-tfstate` (with versioning and encryption)
- DynamoDB table: `collectiq-tfstate-lock` (for state locking)

## Environment Setup

### Development Environment

```bash
cd envs/dev
terraform init
terraform plan
terraform apply
```

Configuration:

- Domain: `dev.collectiq.com`
- Budget: $50/month
- Lambda memory: 512MB
- Debug logging: Enabled

### Production Environment

```bash
cd envs/prod
terraform init
terraform plan
terraform apply  # Requires manual approval
```

Configuration:

- Domain: `app.collectiq.com`
- Budget: $500/month
- Lambda memory: 1024MB
- Debug logging: Disabled
- MFA: Enabled for Cognito

## State Management

Terraform state is stored remotely in S3 with DynamoDB locking:

- **Backend**: S3 bucket `collectiq-tfstate`
- **State files**:
  - Dev: `dev/terraform.tfstate`
  - Prod: `prod/terraform.tfstate`
- **Locking**: DynamoDB table `collectiq-tfstate-lock`
- **Encryption**: Enabled (AES-256)
- **Versioning**: Enabled for state recovery

## Resource Tagging

All resources are automatically tagged with:

```hcl
{
  Project     = "CollectIQ"
  Environment = "dev" | "prod"
  Owner       = "DevOps"
  ManagedBy   = "Terraform"
}
```

## Terraform Commands

```bash
# Initialize Terraform (run first)
terraform init

# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# Plan changes
terraform plan

# Apply changes
terraform apply

# Destroy resources (use with caution!)
terraform destroy

# Show current state
terraform show

# List resources
terraform state list
```

## CI/CD Integration

Terraform changes are validated in CI/CD:

1. `terraform fmt -check` - Enforce formatting
2. `terraform validate` - Syntax validation
3. `tflint` - Linting for best practices
4. `checkov` - Security scanning
5. `terraform plan` - Preview changes
6. Manual approval (prod only)
7. `terraform apply` - Apply changes

## Module Development

When creating new modules:

1. Create module directory in `modules/`
2. Define `main.tf`, `variables.tf`, `outputs.tf`
3. Document inputs and outputs in README
4. Import module in environment `main.tf`
5. Test in dev environment first
6. Promote to prod after validation

## Security Best Practices

- Never commit `.tfvars` files (contains sensitive data)
- Use AWS Secrets Manager for API keys
- Enable encryption for all data at rest
- Use least-privilege IAM policies
- Enable CloudTrail audit logging
- Review security scans before merge

## Troubleshooting

### State Lock Issues

If state is locked:

```bash
# List locks
terraform force-unlock <LOCK_ID>
```

### State Recovery

If state is corrupted:

```bash
# List S3 versions
aws s3api list-object-versions --bucket collectiq-tfstate --prefix dev/

# Download previous version
aws s3api get-object --bucket collectiq-tfstate --key dev/terraform.tfstate --version-id <VERSION_ID> terraform.tfstate.backup

# Restore state
terraform state push terraform.tfstate.backup
```

## Cost Estimation

Use `infracost` to estimate costs before applying:

```bash
infracost breakdown --path .
```

## Support

For questions or issues, contact the DevOps team or refer to:

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [CollectIQ DevOps Specification](../../docs/DevOps/DevOps%20Project%20Specification.md)
