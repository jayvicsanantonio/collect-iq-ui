# CollectIQ Web Application

Next.js 14 frontend for CollectIQ - AI-powered trading card intelligence platform.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- AWS account with appropriate permissions
- Terraform 1.5+ (for infrastructure provisioning)

### Installation

```bash
<<<<<<< HEAD
# Clone the repository
git clone https://github.com/your-org/collect-iq.git
cd collect-iq

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
cp .env.example apps/web/.env.local

# Fill in required AWS credentials:
# - Cognito User Pool ID, Client ID, Domain
# - DynamoDB table name
# - S3 bucket for uploads
# - Bedrock model ID
# - AWS region
```

### Development

```bash
# Start Next.js development server
pnpm web:dev

# Run linting
pnpm lint

# Type-check the codebase
pnpm typecheck

# Build for production
pnpm web:build

# Start production server
pnpm web:start
```

### Infrastructure Deployment

```bash
# Navigate to infrastructure
cd infra/terraform

# Initialize Terraform
terraform init

# Review planned changes
terraform plan

# Apply infrastructure
terraform apply
```

---

=======
pnpm install

````

Create an `.env.local` file in the project root with the environment variables validated in `lib/env.ts`:

- `NEXT_PUBLIC_AWS_REGION`
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
- `NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID`
- `NEXT_PUBLIC_COGNITO_DOMAIN`
- `NEXT_PUBLIC_OAUTH_REDIRECT_URI`
- `NEXT_PUBLIC_OAUTH_LOGOUT_URI`
- `NEXT_PUBLIC_API_BASE`

See [AUTHENTICATION.md](./AUTHENTICATION.md) for Cognito setup details.

### Development

```bash
pnpm dev
````

The app runs at [http://localhost:3000](http://localhost:3000).

### Build

```bash
pnpm build
pnpm start
```

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
```

> > > > > > > 9fd1af9 (Squashed 'apps/web/' content from commit 56c37f3)

## Project Structure

```
<<<<<<< HEAD
collect-iq/
├── apps/
│   └── web/                 # Next.js 14 frontend application
│       ├── app/
│       │   ├── (public)/    # Unauthenticated routes (auth callback, landing)
│       │   ├── (protected)/ # JWT-protected routes (upload, vault, cards)
│       │   └── api/         # API route handlers
│       ├── components/      # React components (auth, cards, upload, vault, ui)
│       └── lib/             # API client, auth helpers, schemas, utilities
├── services/
│   └── backend/             # AWS Lambda + Step Functions backend (TypeScript)
│       ├── src/
│       │   ├── handlers/
│       │   ├── agents/
│       │   ├── orchestration/
│       │   ├── adapters/
│       │   ├── store/
│       │   ├── auth/
│       │   ├── utils/
│       │   └── tests/
│       ├── esbuild.mjs
│       ├── vitest.config.ts
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── shared/              # Shared types/schemas
│   ├── config/              # Shared build/lint/test configuration
│   └── telemetry/           # Logging/metrics utilities
├── infra/
│   └── terraform/
│       ├── modules/
│       │   ├── amplify_hosting/
│       │   ├── api_gateway_http/
│       │   ├── cognito_user_pool/
│       │   ├── s3_uploads/
│       │   ├── dynamodb_collectiq/
│       │   ├── lambda_fn/
│       │   ├── step_functions/
│       │   ├── eventbridge_bus/
│       │   ├── rekognition_access/
│       │   ├── bedrock_access/
│       │   ├── cloudwatch_dashboards/
│       │   ├── ssm_secrets/
│       │   └── xray/
│       └── envs/
│           ├── dev/
│           └── prod/
├── docs/                    # Comprehensive project specifications
│   ├── Frontend/            # UI flows, wireframes, component specs
│   ├── Backend/             # API contracts, Lambda handlers, data models
│   ├── DevOps/              # Terraform modules, CI/CD, cost optimization
│   └── Project Specification.md
├── .kiro/specs/             # Granular requirements, design, and tasks
├── WARP.md                  # Developer guide for Warp AI terminal
├── AGENTS.md                # Repository coding standards and guidelines
└── README.md                # This file
```

### Workspace configuration examples

pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'services/*'
  - 'packages/*'
  - 'infra/*'
```

turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "lint": { "outputs": [] },
    "typecheck": { "outputs": [] },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": [".coverage/**"]
    },
    "dev": { "cache": false, "persistent": true }
  }
}
```

tsconfig.base.json

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "target": "ES2022",
    "moduleResolution": "Bundler",
    "strict": false,
    "baseUrl": ".",
    "paths": {
      "@collectiq/shared/*": ["packages/shared/src/*"],
      "@collectiq/config/*": ["packages/config/src/*"]
    }
  }
}
```

---

## Performance & Scalability

### Performance Targets

- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Interaction to Next Paint (INP)**: < 200ms
- **API latency**: < 3 seconds for full valuation + authenticity workflow
- **Authenticity accuracy**: ≥ 90% on validated samples

### Scalability

- **Serverless architecture** auto-scales with demand
- **DynamoDB on-demand** capacity adjusts to traffic
- **Lambda concurrency** scales to thousands of concurrent executions
- **Step Functions** orchestrates up to 25,000 concurrent workflows
- **Multi-region ready** for global deployment

### Cost Efficiency

**MVP scale** (~10K users, 50K images/month):

- S3 storage: < $5
- Lambda invocations: $15-30
- Step Functions: < $10
- Rekognition API: ~$50
- Bedrock inference: ~$100
- DynamoDB + CloudWatch + Amplify: ~$60

**Total**: $250-300/month MVP → $1-2K/month at moderate adoption

---

## Documentation

Comprehensive specifications available in `/docs` and `.kiro/specs`:

- **Project Specification** — System design, architecture, data models
- **Frontend Specification** — UI flows, component specs, accessibility
- **Backend Specification** — API contracts, Lambda handlers, DynamoDB schema
- **DevOps Specification** — Terraform modules, CI/CD, monitoring
- **Market Opportunity** — Industry analysis, competitive landscape, metrics
- **Product Requirements** — Hackathon and Venture editions

---

## Contributing

For development guidelines, coding standards, and architecture decisions:

1. Read `WARP.md` for comprehensive developer guidance
2. Review `AGENTS.md` for repository conventions
3. Consult `.kiro/specs/` for granular requirements
4. Follow TypeScript non-strict mode conventions
5. Ensure `pnpm lint` and `pnpm typecheck` pass before committing
6. Include tests for new features (Vitest + React Testing Library)
7. Update `.env.example` when adding new environment variables

---

## License

This project is proprietary and confidential.

---

## Contact

# For questions, partnerships, or investment inquiries, please contact the CollectIQ team.

collect-iq-ui/
├── app/ # Next.js App Router
├── components/ # React components
│ ├── auth/ # Authentication components
│ ├── cards/ # Card-related components
│ ├── upload/ # Upload components
│ ├── vault/ # Vault components
│ └── ui/ # shadcn/ui primitives
├── hooks/ # Custom React hooks
├── lib/ # Utilities, API client, types
├── public/ # Static assets (if any)
├── styles/ # Additional styles
└── next.config.mjs # Next.js configuration

```

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (non-strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Data Fetching**: SWR
- **Validation**: Zod
- **Authentication**: Amazon Cognito

## Path Aliases

- `@/*` - Project root
- `@/components/*` - Components directory
- `@/lib/*` - Library/utilities directory
- `@/lib/types` - Shared frontend types and Zod schemas

## Documentation

- [AUTHENTICATION.md](./AUTHENTICATION.md) - Complete authentication guide
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Design system and styling guide
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Environment configuration

## AWS Amplify Hosting

- Connect this repository to Amplify Hosting and set the environment variables above in the Amplify console.
- Use the default Next.js build commands (based on [Amplify's framework build spec](https://docs.amplify.aws/nextjs/deploy-and-host/fullstack-branching/mono-and-multi-repos/)):
  - Pre-build: `corepack enable` and `pnpm install --frozen-lockfile`
  - Build: `pnpm run build`
- Configure the artifact base directory as `.next` so Amplify picks up server and static assets.
- No custom post-build packaging is required; Amplify provisions the compute layer automatically for SSR.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
>>>>>>> 9fd1af9 (Squashed 'apps/web/' content from commit 56c37f3)
```
