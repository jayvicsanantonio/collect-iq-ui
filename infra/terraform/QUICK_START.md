# Terraform Quick Start

Quick reference for common Terraform operations.

## Initial Setup (One-time)

```bash
# 1. Create state management infrastructure
cd infra/terraform/prereq
terraform init && terraform apply

# 2. Initialize dev environment
cd ../envs/dev
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform init

# 3. Initialize prod environment
cd ../prod
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform init
```

## Daily Workflow

```bash
# Navigate to environment
cd infra/terraform/envs/dev  # or prod

# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# Plan changes
terraform plan

# Apply changes
terraform apply

# Show current state
terraform show

# List resources
terraform state list
```

## Module Development

```bash
# Create new module
mkdir -p modules/my_module
cd modules/my_module

# Create module files
touch main.tf variables.tf outputs.tf README.md

# Test module in dev
cd ../../envs/dev
# Add module block to main.tf
terraform init
terraform plan
```

## Troubleshooting

```bash
# Refresh state
terraform refresh

# Force unlock state
terraform force-unlock <LOCK_ID>

# Reinitialize backend
terraform init -reconfigure

# Import existing resource
terraform import <resource_type>.<name> <resource_id>

# Remove resource from state (doesn't delete resource)
terraform state rm <resource_address>

# View specific resource
terraform state show <resource_address>
```

## CI/CD Commands

```bash
# Validation pipeline
terraform fmt -check -recursive
terraform validate
tflint
checkov -d .

# Cost estimation
infracost breakdown --path .

# Plan with output
terraform plan -out=tfplan

# Apply from plan
terraform apply tfplan
```

## State Management

```bash
# List state versions in S3
aws s3api list-object-versions \
  --bucket collectiq-tfstate \
  --prefix dev/terraform.tfstate

# Download state backup
aws s3 cp \
  s3://collectiq-tfstate/dev/terraform.tfstate \
  terraform.tfstate.backup

# Restore state
terraform state push terraform.tfstate.backup

# Pull current state
terraform state pull > current.tfstate
```

## Environment Variables

```bash
# Set AWS credentials
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"

# Set Terraform variables
export TF_VAR_environment="dev"
export TF_VAR_custom_domain="dev.collectiq.com"
```

## Useful Aliases

Add to your `~/.zshrc`:

```bash
# Terraform aliases
alias tf='terraform'
alias tfi='terraform init'
alias tfp='terraform plan'
alias tfa='terraform apply'
alias tfd='terraform destroy'
alias tff='terraform fmt -recursive'
alias tfv='terraform validate'
alias tfs='terraform show'
alias tfsl='terraform state list'

# Navigate to environments
alias tfdev='cd ~/collect-iq/infra/terraform/envs/dev'
alias tfprod='cd ~/collect-iq/infra/terraform/envs/prod'
```

## Resource Targeting

```bash
# Plan specific resource
terraform plan -target=module.cognito

# Apply specific resource
terraform apply -target=module.api_gateway

# Destroy specific resource
terraform destroy -target=module.lambda_fn
```

## Workspace Management (Alternative to envs/)

```bash
# List workspaces
terraform workspace list

# Create workspace
terraform workspace new dev

# Switch workspace
terraform workspace select prod

# Show current workspace
terraform workspace show
```

Note: This project uses separate directories (`envs/dev`, `envs/prod`) instead of workspaces for clearer separation.

## Output Management

```bash
# Show all outputs
terraform output

# Show specific output
terraform output api_endpoint

# Output as JSON
terraform output -json

# Save outputs to file
terraform output -json > outputs.json
```

## Graph Visualization

```bash
# Generate dependency graph
terraform graph | dot -Tpng > graph.png

# View in browser (requires graphviz)
brew install graphviz
terraform graph | dot -Tsvg > graph.svg
open graph.svg
```

## Debugging

```bash
# Enable debug logging
export TF_LOG=DEBUG
export TF_LOG_PATH=terraform.log

# Run with debug output
terraform plan

# Disable debug logging
unset TF_LOG
unset TF_LOG_PATH
```

## Safety Checks

Before applying changes:

1. ✅ Run `terraform plan` and review changes
2. ✅ Check for resource deletions (marked with `-`)
3. ✅ Verify resource replacements (marked with `-/+`)
4. ✅ Ensure no unintended changes
5. ✅ Backup state if making risky changes
6. ✅ Test in dev before applying to prod

## Emergency Procedures

### Rollback Changes

```bash
# Revert to previous git commit
git log --oneline
git checkout <previous-commit>
terraform apply

# Or restore from state backup
aws s3 cp s3://collectiq-tfstate/dev/terraform.tfstate.backup .
terraform state push terraform.tfstate.backup
```

### Recover Deleted Resources

```bash
# If resource deleted but still in state
terraform apply  # Will recreate

# If resource deleted from state
terraform import <resource_type>.<name> <resource_id>
```

### Fix State Drift

```bash
# Detect drift
terraform plan -refresh-only

# Apply drift corrections
terraform apply -refresh-only
```

## Best Practices

1. **Always run `terraform plan` before `apply`**
2. **Use version control for all Terraform code**
3. **Never commit `.tfvars` or state files**
4. **Test changes in dev before prod**
5. **Use modules for reusable components**
6. **Document all variables and outputs**
7. **Enable state locking (already configured)**
8. **Use consistent naming conventions**
9. **Tag all resources appropriately**
10. **Review security scans before merge**

## Quick Reference Card

| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `terraform init`       | Initialize working directory |
| `terraform plan`       | Preview changes              |
| `terraform apply`      | Apply changes                |
| `terraform destroy`    | Destroy resources            |
| `terraform fmt`        | Format code                  |
| `terraform validate`   | Validate configuration       |
| `terraform show`       | Show current state           |
| `terraform state list` | List resources               |
| `terraform output`     | Show outputs                 |
| `terraform refresh`    | Refresh state                |
| `terraform import`     | Import existing resource     |
| `terraform taint`      | Mark resource for recreation |
| `terraform untaint`    | Remove taint mark            |

## Getting Help

```bash
# General help
terraform -help

# Command-specific help
terraform plan -help

# Provider documentation
terraform providers

# Show provider schema
terraform providers schema
```
