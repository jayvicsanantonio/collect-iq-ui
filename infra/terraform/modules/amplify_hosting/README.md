# Amplify Hosting Module

This module provisions AWS Amplify Hosting for Next.js applications with SSR/ISR support.

## Features

- AWS Amplify app with repository integration
- Main and optional develop branch configuration
- Custom domain support with subdomain mapping
- PR preview environments
- Environment variable injection
- Next.js SSR/ISR build configuration

## Usage

```hcl
module "amplify_hosting" {
  source = "../../modules/amplify_hosting"

  app_name   = "collectiq-hackathon"
  repository = "https://github.com/org/repo"

  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - pnpm install
        build:
          commands:
            - pnpm web:build
      artifacts:
        baseDirectory: apps/web/.next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
  EOT

  environment_variables = {
    NEXT_PUBLIC_API_BASE = "https://api.example.com"
  }

  custom_domain = "app.collectiq.com"

  tags = {
    Project     = "CollectIQ"
    Environment = "hackathon"
  }
}
```

## Inputs

| Name                  | Description                            | Type        | Default | Required |
| --------------------- | -------------------------------------- | ----------- | ------- | -------- |
| app_name              | Name of the Amplify application        | string      | -       | yes      |
| repository            | GitHub repository URL                  | string      | -       | yes      |
| build_spec            | Build specification for Next.js        | string      | -       | yes      |
| environment_variables | Environment variables                  | map(string) | {}      | no       |
| custom_domain         | Custom domain (empty for default only) | string      | ""      | no       |

## Outputs

| Name            | Description                 |
| --------------- | --------------------------- |
| app_id          | Amplify app ID              |
| default_domain  | Default Amplify domain      |
| custom_domain   | Custom domain if configured |
| main_branch_url | URL for the main branch     |
