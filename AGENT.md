# Agent Execution Rules & Security Protocols

You are an automated coding agent developing and maintaining this codebase. You must strictly adhere to the following operational, architectural, and security guidelines on every modification.

## 1. Security First
- **No Hardcoded Secrets:** Never hardcode API keys, auth secrets, or tokens in the repository. Access environment variables via Cloudflare Worker bindings (`c.env`).
- **Strict Authorization:** Enforce Role-Based Access Control (RBAC) on every backend API route. Always verify the session and validate that a `partner` can only read/modify their own referrals (`partnerId === user.id`).
- **Input Sanitization & Validation:** Use `zod` for strict request payload validation on all Hono API endpoints. Never execute raw string interpolation into SQL queries—always use Drizzle ORM query builders or parameterized bindings.
- **OWASP Best Practices:** Protect against CSRF, set secure HTTP security headers (HSTS, Content Security Policy, X-Frame-Options), and enforce strict CORS settings.

## 2. Test Execution Mandate
- **Run Tests Before Commit:** Before proposing changes, finalizing tasks, or committing code, you MUST execute `npm run lint`, `npm run typecheck`, and `npm run test:unit`.
- **Run E2E Tests Locally Before Commit:** Before committing any change that touches authentication, routing, or UI flows covered by `/e2e`, you MUST run `npm run test:e2e`. This command uses Playwright's `webServer` config to spin up the app locally (`npm run preview` on `http://localhost:8787`) and run the suite against it — do not run e2e tests against the live/deployed site (`npm run test:e2e:live`) as part of local development; that suite is reserved for the post-deploy CD workflow.
- **Zero Regression Policy:** Never mark a task as complete if any existing test fails. If a feature modification breaks existing unit or E2E tests, update or add tests to reflect the intended behavior.
- **Add Tests for New Features:** Every new API route or business logic addition must be accompanied by unit tests in `/src/tests` and E2E coverage in `/e2e`.

## 3. Edge Runtime Constraints (Cloudflare Workers)
- **Runtime Compatibility:** This application runs on the Cloudflare Workers V8 runtime. Do NOT use Node.js native built-ins (such as `fs`, `path`, or `child_process`) in backend files.
- **Database Access:** Access Cloudflare D1 exclusively through the Drizzle ORM binding (`c.env.DB`). Never attempt direct filesystem SQLite access.

## 4. Code Quality & Architecture
- **Type Safety:** Maintain 100% strict TypeScript types across the backend and frontend. Do not use `any`. Use Hono RPC to export backend endpoint types directly to frontend clients.
- **Atomic Components:** Follow modular React

## 5. Environment-Specific Configuration
- **No Hardcoded Environment Values:** This is a boilerplate project used across multiple environments (production, staging, local, etc.). Never hardcode environment-specific, non-secret values (URLs, hostnames, feature flags, etc.) directly in application or config code, and never use a hardcoded value as a fallback/default.
- **Bubble Up to Env Vars:** Any environment-specific, non-secret value must be sourced from an environment variable (e.g. `LIVE_URL`, `BETTER_AUTH_URL`). If a value is missing, fail fast with a clear error rather than silently defaulting to a specific environment's value.
- **Non-Secret Values:** Store per-environment, non-secret variables (production, staging, etc.) in GitHub Actions variables (`vars`) so each environment can have its own file/set of vars.
- **Secrets:** Store credentials, tokens, and other secrets exclusively in GitHub repository/environment secrets (`secrets`). Never place secrets in vars files or source code.

## 6. Copying This Repo / Boilerplate Features
- **Copying the Repo:** If asked to copy this repo to bootstrap a new project, follow [`COPY_THIS_REPO.md`](./COPY_THIS_REPO.md) exactly. It lists everything that must be copied (including `.github/**` and this file), the Cloudflare resources to create, and every required GitHub/Cloudflare secret and variable.
- **Contributing Back to the Boilerplate:** If a change is a general-purpose improvement to this boilerplate itself (rather than project-specific business logic), it should be tracked using the "🧰 Add a Boilerplate Feature" issue template (`.github/ISSUE_TEMPLATE/boilerplate_feature.yml`) so it can be ported to other projects spawned from this repo.

## Specialized Agent Directory

- **`@security-expert`** (`.github/agents/security-expert.agent.md`): Audits code for OWASP Top 10 vulnerabilities, scans for hardcoded secrets, and proposes secure patches.
- **`@database-expert`** (`.github/agents/database-expert.agent.md`): Reviews ORM models, SQL queries, and migration safety to enforce strict zero-data-loss and non-blocking DDL rules.
- **`@devops-expert`** (`.github/agents/devops-expert.agent.md`): Manages Cloudflare Workers infrastructure, Wrangler bindings, GitHub Actions CI/CD pipelines, and secrets.
- **`@frontend-design-expert`** (`.github/agents/frontend-design-expert.agent.md`): Picks a deliberate UI aesthetic direction, enforces cohesive design tokens/typography, and eliminates generic "AI slop" component patterns. Backed by the `.github/skills/frontend-design/SKILL.md` Copilot agent skill (see `.github/skills/SOURCES.md` for its upstream source and update steps).

### Routing Guidelines
* When editing `wrangler.jsonc`, `.github/workflows/`, or environment secrets, invoke `@devops-expert`.
* When creating or restyling pages/components under `src/frontend/`, or editing `tailwind.config.js`/`src/frontend/index.css`, invoke `@frontend-design-expert`.
