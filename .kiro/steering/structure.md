# Project Structure

## Monorepo Organization

CollectIQ uses a pnpm workspace monorepo with clear separation between applications and shared packages.

```
collect-iq/
├── apps/                    # Application packages
│   └── web/                 # Next.js 14 frontend (primary app)
│       ├── app/
│       │   ├── (public)/    # Unauthenticated routes (landing, auth callback)
│       │   ├── (protected)/ # JWT-protected routes (upload, vault, cards)
│       │   └── api/         # API route handlers
│       ├── components/      # React components
│       │   ├── auth/        # Authentication components
│       │   ├── cards/       # Card display and management
│       │   ├── upload/      # Image upload UI
│       │   ├── vault/       # Collection vault
│       │   └── ui/          # shadcn/ui components
│       └── lib/             # Utilities and helpers
│           ├── api/         # API client functions
│           ├── auth/        # Auth helpers
│           ├── schemas/     # Zod validation schemas
│           └── utils/       # Shared utilities
│
├── packages/                # Shared packages
│   └── infra/               # Terraform infrastructure as code
│       ├── modules/
│       │   ├── amplify/     # Frontend hosting
│       │   ├── api/         # API Gateway + Lambda
│       │   ├── auth/        # Cognito configuration
│       │   ├── storage/     # DynamoDB + S3
│       │   └── ai/          # Bedrock + Rekognition
│       └── environments/    # Dev, staging, production configs
│
├── docs/                    # Comprehensive specifications
│   ├── Frontend/            # UI flows, wireframes, component specs
│   ├── Backend/             # API contracts, Lambda handlers, data models
│   ├── DevOps/              # Terraform modules, CI/CD, cost optimization
│   ├── Project Specification.md
│   ├── Hackathon - Product Requirements.md
│   ├── Venture - Product Requirements.md
│   └── Market Opportunity.md
│
├── .kiro/                   # Kiro IDE configuration
│   ├── specs/               # Granular requirements, design, and tasks
│   └── steering/            # AI assistant guidance (this file)
│
├── types/                   # Global TypeScript definitions
│   └── global.d.ts
│
├── .github/                 # GitHub Actions workflows
├── node_modules/            # Root dependencies
├── .pnpm-store/             # pnpm content-addressable store
│
├── package.json             # Root workspace configuration
├── pnpm-workspace.yaml      # Workspace package definitions
├── tsconfig.base.json       # Base TypeScript configuration
├── eslint.config.mjs        # ESLint v9 flat config
├── .prettierrc              # Prettier formatting rules
├── .prettierignore          # Prettier ignore patterns
├── WARP.md                  # Developer guide for Warp AI terminal
├── AGENTS.md                # Repository coding standards
└── README.md                # Project overview
```

## Key Conventions

### Route Organization (Next.js App Router)

- **(public)**: Unauthenticated routes accessible to all users
- **(protected)**: Routes requiring valid Cognito JWT
- **api/**: Server-side API route handlers

### Component Structure

- Group by feature domain (auth, cards, upload, vault)
- `ui/` contains reusable shadcn/ui components
- Each component should be self-contained with co-located types

### Infrastructure Modules

- Each Terraform module is self-contained with inputs, outputs, and resources
- Modules are environment-agnostic; configuration lives in `environments/`

### Documentation Hierarchy

1. **README.md**: High-level overview and quick start
2. **docs/**: Detailed specifications by domain
3. **.kiro/specs/**: Granular implementation requirements
4. **.kiro/steering/**: AI assistant guidance rules

## Data Flow Architecture

```
User → Next.js Frontend → API Gateway (JWT validation)
  → Lambda Handler → Step Functions Orchestration
    → Rekognition (feature extraction)
    → Bedrock Agents (valuation + authenticity)
    → DynamoDB (persistence)
  → EventBridge (event coordination)
```

## Single-Table DynamoDB Design

- **PK**: `USER#{sub}` (Cognito user ID for data isolation)
- **SK**: `CARD#{cardId}` or `PRICE#{ISO8601}` (entity type + identifier)
- **GSI1**: userId (for vault queries)
- **GSI2**: set#rarity (for analytics)

## S3 Upload Structure

- Path pattern: `uploads/{sub}/{uuid}`
- Presigned URLs expire in 60 seconds
- User-scoped access enforced via IAM policies
