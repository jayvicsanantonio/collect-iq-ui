# Implementation Plan

- [ ] 1. Set up Terraform project structure and state management
  - Create infra/terraform directory with modules and envs subdirectories
  - Create S3 bucket for Terraform state with versioning enabled
  - Create DynamoDB table for state locking (collectiq-terraform-locks)
  - Configure backend.tf with S3 and DynamoDB backend
  - Create dev and prod environment directories with main.tf, variables.tf, outputs.tf
  - Set up .gitignore to exclude .terraform, _.tfstate, _.tfvars
  - Initialize Terraform in both environments
  - _Requirements: 1.2, 1.7, 17.1_

- [ ] 2. Create reusable Terraform modules
- [ ] 2.1 Create amplify_hosting module
  - Define aws_amplify_app resource with repository integration
  - Configure aws_amplify_branch for main and develop branches
  - Set up aws_amplify_domain_association for custom domain
  - Configure environment variables input
  - Define build_spec for Next.js SSR/ISR
  - Create outputs for app_id, default_domain, custom_domain
  - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [ ] 2.2 Create cognito_user_pool module
  - Define aws_cognito_user_pool with email sign-up
  - Configure password policy (min 8 chars, uppercase, lowercase, number, symbol)
  - Set auto_verified_attributes to ["email"]
  - Configure MFA as OPTIONAL
  - Create aws_cognito_user_pool_client with OAuth settings
  - Set up aws_cognito_user_pool_domain for Hosted UI
  - Configure callback_urls and logout_urls
  - Create outputs for user_pool_id, client_id, hosted_ui_domain, jwks_url
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 2.3 Create api_gateway_http module
  - Define aws_apigatewayv2_api resource (HTTP API)
  - Create aws_apigatewayv2_authorizer with Cognito JWT
  - Configure aws_apigatewayv2_stage with logging
  - Set up throttling settings (dev: 100 req/s, prod: 1000 req/s)
  - Configure CORS with Amplify origin
  - Create aws_apigatewayv2_route for each endpoint
  - Create aws_apigatewayv2_integration for Lambda functions
  - Create outputs for api_endpoint, api_id, authorizer_id
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [ ] 2.4 Create dynamodb_collectiq module
  - Define aws_dynamodb_table with single-table design
  - Set partition key PK and sort key SK
  - Create GSI1 with userId and createdAt
  - Create GSI2 with set#rarity and valueMedian
  - Configure on-demand billing mode
  - Enable point-in-time recovery
  - Enable encryption at rest
  - Configure TTL attribute
  - Create outputs for table_name, table_arn, gsi1_name, gsi2_name
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [ ] 2.5 Create s3_uploads module
  - Define aws_s3_bucket resource
  - Configure aws_s3_bucket_public_access_block (all true)
  - Set up aws_s3_bucket_server_side_encryption_configuration (SSE-S3)
  - Create bucket policy enforcing aws:SecureTransport
  - Configure aws_s3_bucket_cors_configuration for presigned PUT
  - Set up aws_s3_bucket_lifecycle_configuration (Glacier after 90 days, delete after 365)
  - Create outputs for bucket_name, bucket_arn
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [ ] 2.6 Create lambda_fn module
  - Define aws_lambda_function resource with configurable parameters
  - Create aws_iam_role for Lambda execution
  - Attach aws_iam_role_policy for basic Lambda execution
  - Configure aws_cloudwatch_log_group with retention
  - Enable X-Ray tracing
  - Create aws_lambda_alias for blue/green deployments
  - Support environment variables input
  - Create outputs for function_name, function_arn, role_arn, alias_arn
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [ ] 2.7 Create step_functions module
  - Define aws_sfn_state_machine resource
  - Accept ASL (Amazon States Language) JSON as input
  - Create aws_iam_role for Step Functions execution
  - Grant permissions to invoke Lambda functions
  - Configure CloudWatch Logs for execution history
  - Create outputs for state_machine_arn, role_arn
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_

- [ ] 2.8 Create eventbridge_bus module
  - Define aws_cloudwatch_event_bus resource
  - Create aws_cloudwatch_event_rule for CardValuationUpdated
  - Create aws_cloudwatch_event_rule for AuthenticityFlagged
  - Set up aws_cloudwatch_event_target for Lambda/SQS
  - Create aws_sqs_queue for DLQ
  - Configure dead_letter_config for event rules
  - Create outputs for bus_name, bus_arn, dlq_url
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [ ] 2.9 Create rekognition_access module
  - Create IAM policy document for rekognition:DetectText
  - Create IAM policy document for rekognition:DetectLabels
  - Create IAM policy document for s3:GetObject (scoped to uploads bucket)
  - Create aws_iam_policy resource
  - Create outputs for policy_arn
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 2.10 Create bedrock_access module
  - Create IAM policy document for bedrock:InvokeModel
  - Scope policy to specific model ARNs (Claude 3 Sonnet)
  - Create aws_iam_policy resource
  - Create outputs for policy_arn
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [ ] 2.11 Create cloudwatch_dashboards module
  - Define aws_cloudwatch_dashboard for API performance
  - Define aws_cloudwatch_dashboard for Lambda performance
  - Define aws_cloudwatch_dashboard for Step Functions
  - Define aws_cloudwatch_dashboard for data layer (DynamoDB, S3)
  - Define aws_cloudwatch_dashboard for AI services (Rekognition, Bedrock)
  - Create widgets for metrics visualization
  - _Requirements: 13.1, 13.2_

- [ ] 2.12 Create ssm_secrets module
  - Define aws_secretsmanager_secret for eBay API key
  - Define aws_secretsmanager_secret for TCGPlayer keys
  - Define aws_secretsmanager_secret for PriceCharting key
  - Configure automatic rotation where supported
  - Create IAM policy for secretsmanager:GetSecretValue
  - Create outputs for secret_arns, policy_arn
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ] 3. Configure development environment
- [ ] 3.1 Create dev environment configuration
  - Create infra/terraform/envs/dev/main.tf
  - Import all modules with dev-specific parameters
  - Set environment = "dev"
  - Configure custom_domain = "dev.collectiq.com"
  - Set Lambda memory to 512MB
  - Enable debug logging
  - Configure budget alert at $50
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

- [ ] 3.2 Create dev variables and outputs
  - Define variables.tf with all required inputs
  - Define outputs.tf with backend and frontend outputs
  - Create terraform.tfvars with dev-specific values
  - Document all variables in README
  - _Requirements: 17.1, 17.4_

- [ ] 3.3 Deploy dev environment
  - Run terraform init in dev directory
  - Run terraform plan and review changes
  - Run terraform apply to provision resources
  - Verify all outputs are correct
  - Test API Gateway /healthz endpoint
  - Test Cognito Hosted UI accessibility
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

- [ ] 4. Configure production environment
- [ ] 4.1 Create prod environment configuration
  - Create infra/terraform/envs/prod/main.tf
  - Import all modules with prod-specific parameters
  - Set environment = "prod"
  - Configure custom_domain = "app.collectiq.com"
  - Set Lambda memory to 1024MB
  - Disable debug logging (info only)
  - Configure budget alert at $500
  - Enable MFA for Cognito
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

- [ ] 4.2 Create prod variables and outputs
  - Define variables.tf with all required inputs
  - Define outputs.tf with backend and frontend outputs
  - Create terraform.tfvars with prod-specific values
  - Document all variables in README
  - _Requirements: 17.1, 17.4_

- [ ] 4.3 Deploy prod environment with approval
  - Run terraform init in prod directory
  - Run terraform plan and review changes
  - Obtain manual approval from team lead
  - Run terraform apply to provision resources
  - Verify all outputs are correct
  - Test API Gateway /healthz endpoint
  - Test Cognito Hosted UI accessibility
  - _Requirements: 1.5, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

- [ ] 5. Configure Lambda functions
- [ ] 5.1 Deploy upload_presign Lambda
  - Use lambda_fn module with function code from backend
  - Set memory to 512MB, timeout to 30 seconds
  - Grant s3:PutObject permission (scoped to uploads/ prefix)
  - Set environment variables: BUCKET_UPLOADS, MAX_UPLOAD_MB, ALLOWED_UPLOAD_MIME
  - Create API Gateway integration
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [ ] 5.2 Deploy cards CRUD Lambdas
  - Deploy cards_create Lambda with dynamodb:PutItem permission
  - Deploy cards_list Lambda with dynamodb:Query permission (GSI1)
  - Deploy cards_get Lambda with dynamodb:GetItem permission
  - Deploy cards_delete Lambda with dynamodb:DeleteItem permission
  - Set environment variables: DDB_TABLE, COGNITO_USER_POOL_ID
  - Create API Gateway integrations for all functions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [ ] 5.3 Deploy cards_revalue Lambda
  - Use lambda_fn module with function code
  - Grant states:StartExecution permission for Step Functions
  - Set environment variables: STEP_FUNCTIONS_ARN, DDB_TABLE
  - Create API Gateway integration
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [ ] 5.4 Deploy rekognition_extract Lambda
  - Use lambda_fn module with function code
  - Set memory to 1024MB, timeout to 5 minutes
  - Attach rekognition_access IAM policy
  - Grant s3:GetObject permission for uploads bucket
  - Set environment variables: BUCKET_UPLOADS
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 5.5 Deploy pricing_agent Lambda
  - Use lambda_fn module with function code
  - Set memory to 1024MB, timeout to 5 minutes
  - Attach ssm_secrets IAM policy for API keys
  - Set environment variables: EBAY_SECRET_ARN, TCGPLAYER_SECRET_ARN, PRICECHARTING_SECRET_ARN, DDB_TABLE
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 5.6 Deploy authenticity_agent Lambda
  - Use lambda_fn module with function code
  - Set memory to 1024MB, timeout to 5 minutes
  - Attach bedrock_access IAM policy
  - Grant s3:GetObject permission for authentic-samples bucket
  - Set environment variables: BEDROCK_MODEL_ID, BUCKET_UPLOADS, BUCKET_SAMPLES
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [ ] 5.7 Deploy aggregator Lambda
  - Use lambda_fn module with function code
  - Grant dynamodb:UpdateItem permission
  - Grant events:PutEvents permission for EventBridge
  - Set environment variables: DDB_TABLE, EVENT_BUS_NAME
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [ ] 5.8 Deploy error_handler Lambda
  - Use lambda_fn module with function code
  - Grant sqs:SendMessage permission for DLQ
  - Set environment variables: DLQ_URL, DDB_TABLE
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [ ] 6. Configure Step Functions workflow
- [ ] 6.1 Create state machine ASL definition
  - Define RekognitionExtract task pointing to rekognition_extract Lambda
  - Configure retry policy (3 attempts, backoff rate 2.0)
  - Define Parallel state with PricingAgent and AuthenticityAgent branches
  - Define Aggregator task pointing to aggregator Lambda
  - Configure error handler with catch-all to error_handler Lambda
  - Save ASL JSON to file
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_

- [ ] 6.2 Deploy Step Functions state machine
  - Use step_functions module with ASL definition
  - Grant IAM permissions to invoke all task Lambdas
  - Enable CloudWatch Logs for execution history
  - Create outputs for state_machine_arn
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_

- [ ]\* 6.3 Test Step Functions workflow
  - Manually trigger execution with test input
  - Verify RekognitionExtract completes successfully
  - Verify parallel agents execute concurrently
  - Verify Aggregator persists results to DynamoDB
  - Verify EventBridge event is emitted
  - Test error handling by injecting failures
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_

- [ ] 7. Configure CloudWatch monitoring
- [ ] 7.1 Create CloudWatch dashboards
  - Deploy cloudwatch_dashboards module
  - Configure API performance dashboard with 4xx/5xx rates, latency
  - Configure Lambda performance dashboard with errors, duration, throttles
  - Configure Step Functions dashboard with execution metrics
  - Configure data layer dashboard with DynamoDB and S3 metrics
  - Configure AI services dashboard with Rekognition and Bedrock metrics
  - _Requirements: 13.1, 13.2_

- [ ] 7.2 Create CloudWatch alarms
  - Create alarm for API 5xx rate > 5% for 5 minutes
  - Create alarm for Lambda error rate > 10% for 5 minutes
  - Create alarm for Step Functions failed executions > 10 in 15 minutes
  - Create alarm for DLQ depth > 10 messages
  - Create alarm for API P95 latency > 1000ms for 10 minutes
  - Create alarm for DynamoDB throttles
  - Create alarm for AWS Budget 80% threshold
  - Configure SNS topics for alarm notifications
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

- [ ] 7.3 Configure X-Ray tracing
  - Enable X-Ray on all Lambda functions (already done in lambda_fn module)
  - Enable X-Ray on API Gateway
  - Enable X-Ray on Step Functions
  - Verify service map shows complete request flow
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

- [ ] 8. Set up CI/CD pipelines
- [ ] 8.1 Create backend CI/CD pipeline
  - Create GitHub Actions workflow for backend
  - Add lint job (ESLint)
  - Add typecheck job (tsc)
  - Add unit test job (Vitest)
  - Add integration test job (LocalStack)
  - Add package job (esbuild Lambda functions)
  - Add deploy job (upload artifacts to S3, update Lambda functions)
  - Add smoke test job (verify /healthz endpoint)
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

- [ ] 8.2 Create infrastructure CI/CD pipeline
  - Create GitHub Actions workflow for Terraform
  - Add validate job (terraform fmt, validate, tflint, checkov)
  - Add plan job (terraform plan, post as PR comment)
  - Add apply job with manual approval gate
  - Add infracost job for cost estimation
  - Configure separate workflows for dev and prod
  - _Requirements: 1.4, 1.5, 1.6, 14.1, 14.2, 14.3_

- [ ] 8.3 Configure Amplify auto-deployment
  - Connect Amplify app to GitHub repository
  - Configure auto-build on push to main (prod) and develop (dev)
  - Enable PR preview environments
  - Configure build failure alarms
  - _Requirements: 2.2, 2.3, 14.4_

- [ ] 8.4 Implement Lambda canary deployments
  - Configure Lambda aliases in lambda_fn module
  - Set up CodeDeploy for canary deployments (10% traffic)
  - Configure CloudWatch alarms for automatic rollback
  - Test canary deployment with intentional error
  - Verify automatic rollback on alarm breach
  - _Requirements: 14.5, 14.6_

- [ ] 9. Configure secrets management
- [ ] 9.1 Store external API keys in Secrets Manager
  - Create secret for eBay API key
  - Create secret for TCGPlayer public and private keys
  - Create secret for PriceCharting API key
  - Configure automatic rotation schedules where supported
  - Grant Lambda IAM roles secretsmanager:GetSecretValue permission
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ] 9.2 Update Lambda functions to retrieve secrets
  - Modify pricing_agent Lambda to retrieve API keys from Secrets Manager
  - Implement in-memory caching for secrets (Lambda execution lifetime)
  - Handle secret rotation gracefully
  - Test secret retrieval and caching
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 10. Implement cost optimization
- [ ] 10.1 Configure AWS Budgets
  - Create budget for dev environment ($50/month)
  - Create budget for prod environment ($500/month)
  - Set alerts at 80% and 100% thresholds
  - Configure SNS notifications for budget alerts
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8_

- [ ] 10.2 Implement cost allocation tags
  - Tag all resources with Project=CollectIQ
  - Tag all resources with Environment (dev/prod)
  - Tag all resources with Owner=DevOps
  - Tag all resources with ManagedBy=Terraform
  - Enable cost allocation tags in AWS Billing console
  - _Requirements: 1.3, 16.7_

- [ ] 10.3 Optimize Lambda memory allocation
  - Set lightweight APIs to 512MB (presign, list, get)
  - Set heavy processing to 1024MB (rekognition_extract, pricing_agent, authenticity_agent)
  - Monitor Lambda duration and adjust memory as needed
  - _Requirements: 16.1, 20.2_

- [ ] 10.4 Configure DynamoDB autoscaling
  - Set up autoscaling for read and write capacity (prod only)
  - Configure target utilization at 70%
  - Set minimum and maximum capacity units
  - Monitor DynamoDB throttles and adjust as needed
  - _Requirements: 16.2, 20.3_

- [ ] 10.5 Implement S3 lifecycle policies
  - Configure transition to Glacier after 90 days for uploads/
  - Configure deletion after 365 days for uploads/
  - Keep authentic-samples/ without expiration
  - _Requirements: 7.6, 16.5_

- [ ] 11. Create runbooks and documentation
- [ ] 11.1 Create alarm response runbooks
  - Document procedures for API 5xx rate high
  - Document procedures for Lambda error rate high
  - Document procedures for Step Functions failed executions
  - Document procedures for DLQ depth increasing
  - Include troubleshooting steps and escalation paths
  - _Requirements: 19.1, 19.2, 19.3, 19.4_

- [ ] 11.2 Create operational procedures
  - Document Rekognition/Bedrock quota increase procedures
  - Document secrets rotation procedures
  - Document Lambda rollback procedures
  - Document Terraform state recovery procedures
  - Document disaster recovery procedures
  - _Requirements: 19.2, 19.5, 19.6_

- [ ] 11.3 Create deployment documentation
  - Document Terraform module usage
  - Document environment configuration
  - Document CI/CD pipeline setup
  - Document smoke test procedures
  - Create deployment checklist
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

- [ ] 12. Implement security best practices
- [ ] 12.1 Configure IAM least privilege
  - Review all Lambda IAM roles
  - Scope S3 permissions to specific bucket ARNs and prefixes
  - Scope DynamoDB permissions to table and index ARNs
  - Remove any overly permissive policies
  - _Requirements: 15.1, 15.2, 15.3_

- [ ] 12.2 Enable encryption
  - Verify S3 encryption at rest (SSE-S3)
  - Verify DynamoDB encryption at rest
  - Verify Secrets Manager encryption (KMS)
  - Verify CloudWatch Logs encryption (KMS)
  - _Requirements: 15.4_

- [ ] 12.3 Configure bucket policies
  - Enforce aws:SecureTransport on S3 buckets
  - Deny public access on all S3 buckets
  - Verify bucket policies are applied
  - _Requirements: 15.5_

- [ ] 12.4 Enable audit logging
  - Enable CloudTrail for all API calls
  - Configure CloudTrail to log to S3
  - Set up CloudTrail log file validation
  - Configure CloudWatch Logs integration
  - _Requirements: 15.7_

- [ ] 13. Perform disaster recovery testing
- [ ] 13.1 Test DynamoDB point-in-time recovery
  - Create test data in DynamoDB
  - Perform point-in-time recovery to new table
  - Verify data integrity
  - Document recovery time
  - _Requirements: 18.1, 18.4, 18.5_

- [ ] 13.2 Test S3 versioning and recovery
  - Upload test objects to S3
  - Delete objects
  - Restore from previous versions
  - Verify object integrity
  - _Requirements: 18.2_

- [ ] 13.3 Test Terraform state recovery
  - Create backup of Terraform state
  - Simulate state corruption
  - Restore from S3 version
  - Verify state matches infrastructure
  - _Requirements: 18.3, 18.4_

- [ ] 14. Perform end-to-end testing
- [ ]\* 14.1 Test complete user flow
  - Sign up via Cognito Hosted UI
  - Verify email and sign in
  - Request presigned URL
  - Upload test card image to S3
  - Create card record via API
  - Trigger revaluation
  - Verify Step Functions execution completes
  - Verify results persisted to DynamoDB
  - Verify EventBridge event emitted
  - _Requirements: All_

- [ ]\* 14.2 Test error scenarios
  - Test invalid JWT (401)
  - Test accessing other user's card (403)
  - Test uploading oversized file (413)
  - Test rate limiting (429)
  - Test Lambda timeout
  - Test Step Functions failure and DLQ routing
  - _Requirements: All_

- [ ]\* 14.3 Test monitoring and alerting
  - Trigger CloudWatch alarms intentionally
  - Verify SNS notifications are sent
  - Verify runbook procedures work
  - Test X-Ray trace analysis
  - Test CloudWatch Logs Insights queries
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

- [ ] 15. Production readiness checklist
- [ ] 15.1 Verify all infrastructure is provisioned
  - Amplify app deployed with custom domain
  - Cognito user pool configured with Hosted UI
  - API Gateway with JWT authorizer
  - All Lambda functions deployed
  - Step Functions state machine created
  - DynamoDB table with GSIs
  - S3 buckets with proper policies
  - EventBridge bus with rules
  - CloudWatch dashboards and alarms
  - Secrets Manager secrets configured
  - _Requirements: All_

- [ ] 15.2 Verify security controls
  - IAM roles follow least privilege
  - Encryption enabled for all data at rest
  - HTTPS enforced for all endpoints
  - Bucket policies deny public access
  - CloudTrail audit logging enabled
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

- [ ] 15.3 Verify monitoring and alerting
  - CloudWatch dashboards display metrics
  - CloudWatch alarms configured and tested
  - X-Ray tracing enabled
  - Structured logging implemented
  - SNS notifications working
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

- [ ] 15.4 Verify cost controls
  - AWS Budgets configured
  - Cost allocation tags applied
  - Lambda memory optimized
  - DynamoDB autoscaling configured (prod)
  - S3 lifecycle policies applied
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8_

- [ ] 15.5 Verify documentation
  - Runbooks created and reviewed
  - Deployment documentation complete
  - Architecture diagrams updated
  - README files in all modules
  - Terraform variables documented
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

- [ ] 15.6 Perform final smoke tests
  - Test /healthz endpoint
  - Test Cognito Hosted UI sign in/sign up
  - Test complete card upload and valuation flow
  - Test API error handling
  - Test monitoring and alerting
  - _Requirements: All_
