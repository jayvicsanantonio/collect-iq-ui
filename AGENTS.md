# Repository Guidelines

## Project Structure & Module Organization

- Monorepo via `pnpm` workspaces.
- `apps/web`: Next.js 14 (App Router) UI. Key dirs: `app/`, `components/`, `lib/` (e.g., `apps/web/components/upload/UploadDropzone.tsx`).
- `packages/infra`: Infra placeholder; Terraform per specs will live here. Scripts currently stubbed.
- `docs/` and `.kiro/specs/*`: Authoritative Frontend/Backend/DevOps requirements, design, and tasks. Keep synced when flows change.
- Root config: `eslint.config.mjs`, `.prettierrc`, `tsconfig.base.json`, `pnpm-workspace.yaml`.

## Build, Test, and Development Commands

- Install: `pnpm install`
- Env: `cp .env.example .env` and `cp .env.example apps/web/.env.local`
  - Required (from specs): Cognito User Pool ID/Client ID/Domain, API base URL, AWS region.
- Web dev: `pnpm web:dev` • Build: `pnpm web:build` • Start: `pnpm web:start`
- Lint: `pnpm lint` (ESLint v9 + Prettier) • Types: `pnpm typecheck`
- Infra (per specs, once added): Terraform modules for Amplify, API Gateway, Cognito, DynamoDB, S3, Step Functions.

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

## Commit & Pull Request Guidelines

- Commits: imperative, single concern (e.g., "Implement upload presign flow").
- PRs: describe scope, link Kiro requirement IDs (e.g., FE R2.4, BE R3.2, DO R4.3), include UI screenshots, steps, and env changes. Ensure `pnpm lint` and `pnpm typecheck` pass; update `.env.example` and relevant specs.

## Architecture & Security Notes

- Auth via Cognito Hosted UI; store JWT in HTTP-only cookies. Never use localStorage for tokens.
- Uploads use presigned S3 PUT; enforce MIME and ≤12MB.
- API contract: ProblemDetails errors; idempotency for mutating endpoints.
- Strict headers (per specs): CSP (no inline), Referrer-Policy strict-origin-when-cross-origin, X-Frame-Options DENY.
- DevOps: Deploy Next.js via Amplify; backend via API Gateway + Lambda; Step Functions orchestrate Rekognition → Bedrock; provision with Terraform modules and least-privilege IAM.
