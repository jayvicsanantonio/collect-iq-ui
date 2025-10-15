# Repository Guidelines

## Project Structure & Module Organization

- Monorepo via `pnpm` workspaces.
- `apps/web`: Next.js 14 (App Router) UI. Key dirs: `app/`, `components/`, `lib/` (e.g., `apps/web/components/upload/UploadDropzone.tsx`).
  - `(public)/`: Unauthenticated routes (landing, auth callback)
  - `(protected)/`: JWT-protected routes requiring valid Cognito tokens (upload, vault, cards)
  - `api/`: Server-side API route handlers
- `packages/infra`: Terraform IaC with modular design. Modules: `amplify/`, `api/`, `auth/`, `storage/`, `ai/`.
- `docs/`: Authoritative specifications organized by domain (Frontend, Backend, DevOps, Project Specification, Market Opportunity).
- `.kiro/specs/*`: Granular Frontend/Backend/DevOps requirements, design, and tasks. Keep synced when flows change.
- `.kiro/steering/*`: AI assistant guidance rules (product overview, structure conventions, tech stack).
- Root config: `eslint.config.mjs`, `.prettierrc`, `tsconfig.base.json`, `pnpm-workspace.yaml`.

## Build, Test, and Development Commands

- Install: `pnpm install`
- Env: `cp .env.example .env` and `cp .env.example apps/web/.env.local`
  - Required: Cognito User Pool ID/Client ID/Domain, DynamoDB table, S3 bucket, Bedrock model ID, AWS region.
- Web dev: `pnpm web:dev` • Build: `pnpm web:build` • Start: `pnpm web:start`
- Lint: `pnpm lint` (ESLint v9 + Prettier) • Types: `pnpm typecheck`
- Infra: From `packages/infra/`: `terraform init` → `terraform plan` → `terraform apply`
  - Terraform modules for Amplify, API Gateway, Cognito, DynamoDB, S3, Step Functions, Bedrock, Rekognition.

## Coding Style & Naming Conventions

- TypeScript (not strict), 2-space indent. Prettier enforced (`semi: true`, `singleQuote: true`, `trailingComma: all`, `printWidth: 100`).
- React components PascalCase; utilities `camelCase`; route segments lower-kebab.
- Next route groups: `(public)` and `(protected)`; protect via AuthGuard. Prefer colocated components/tests.
- Use Tailwind v4 + shadcn/ui; avoid inline styles. Validate data with Zod; handle errors as RFC 7807 ProblemDetails.

## Testing Guidelines

- Preferred stack per specs: Vitest + React Testing Library (unit/integration), Playwright (E2E), axe-core (a11y).
- Name tests `*.test.ts[x]`; place alongside source or in `tests/`.
- E2E must cover: auth redirect via Cognito Hosted UI, upload → identify → authenticity → valuation → save, vault filtering, session expiry.
- Performance gates (target): LCP < 2.5s, CLS < 0.1, INP < 200ms (Lighthouse CI).

## Task Tracking & Completion

**CRITICAL**: When completing any frontend, backend, or DevOps task, update the appropriate task file:

- Frontend tasks: `.kiro/specs/collectiq-frontend/tasks.md`
- Backend tasks: `.kiro/specs/collectiq-backend/tasks.md`
- DevOps tasks: `.kiro/specs/collectiq-devops/tasks.md`

Mark tasks as completed by updating their status/checkboxes and adding completion notes (date, implementation details, any deviations from spec).

## Commit & Pull Request Guidelines

- Commits: imperative, single concern (e.g., "Implement upload presign flow").
- PRs: describe scope, link Kiro requirement IDs (e.g., FE R2.4, BE R3.2, DO R4.3), include UI screenshots, steps, and env changes. Ensure `pnpm lint` and `pnpm typecheck` pass; update `.env.example` and relevant specs.
- **Always update task completion status** in the appropriate `.kiro/specs/collectiq-*/tasks.md` file before closing a PR.

## Architecture & Security Notes

- Auth via Cognito Hosted UI (OAuth 2.0 + PKCE); store JWT in HTTP-only cookies. Never use localStorage for tokens.
- Uploads use presigned S3 PUT (scoped to `uploads/{sub}/{uuid}`); enforce MIME and ≤12MB; URLs expire in 60 seconds.
- API contract: ProblemDetails (RFC 7807) errors; idempotency for mutating endpoints.
- Strict headers (per specs): CSP (no inline), Referrer-Policy strict-origin-when-cross-origin, X-Frame-Options DENY.
- DynamoDB single-table design: `PK: USER#{sub}`, `SK: CARD#{cardId}` or `PRICE#{ISO8601}`. GSI1 (userId), GSI2 (set#rarity).
- Multi-agent orchestration: Step Functions coordinate Rekognition → Bedrock agents (Ingestion, Valuation, Authenticity, Feedback) → DynamoDB → EventBridge.
- DevOps: Deploy Next.js via Amplify; backend via API Gateway + Lambda; provision with Terraform modules and least-privilege IAM.
