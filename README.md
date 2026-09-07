# Boiler-plate-webapp-cloudflare

A full-stack boilerplate web application built to run entirely on the Cloudflare
Workers platform. It is implemented as a "Dashboard" that lets
**partners** submit and track client referrals while **admins** manage users and
review all referrals.

## Tech Stack

- **Cloudflare Workers** – edge runtime hosting both the API and static assets
- **Cloudflare D1** – SQLite-compatible database, accessed via **Drizzle ORM**
- **Hono** – lightweight web framework for the backend API, with Hono RPC used
  to share type-safe API contracts with the frontend
- **better-auth** – authentication (email/password) with session management
- **React 19** + **React Router** – single-page application frontend
- **Tailwind CSS** – utility-first styling
- **Zod** – request payload validation on API endpoints
- **Vitest** – unit tests (using `@cloudflare/vitest-pool-workers`)
- **Playwright** – end-to-end tests

## Features Implemented So Far

- Email/password sign up and sign in (`better-auth`)
- Role-based access control (RBAC) with `admin` and `partner` roles
- User account status flow: `pending` → `active` / `deactivated`, with a
  "pending approval" page shown to new partners
- Partner dashboard for submitting and tracking referrals
  (client name/email/phone, notes, status, deal value, estimated commission)
- Admin dashboard for managing users and reviewing all referrals
- Backend API (Hono) routes for referrals (`/api/referrals`) and admin user
  management (`/api/admin/users`), enforcing that partners can only access
  their own referrals
- Database schema and migrations (Drizzle) for `users`, `referrals`,
  `sessions`, `accounts`, and `verifications` tables
- Security hardening: secure HTTP headers, CORS restricted to the configured
  origin, and Zod-based input validation
- Unit tests for backend routes and end-to-end tests for auth, admin, and
  partner flows

## Project Structure

```
src/
  backend/        Hono API (routes, auth, RBAC middleware)
  db/             Drizzle schema and database access
  frontend/       React app (pages, components, lib)
  tests/          Unit tests
e2e/              Playwright end-to-end tests
drizzle/          Generated SQL migrations
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the app locally with Vite:

```bash
npm run dev
```

Build and preview using Wrangler (Cloudflare Workers runtime):

```bash
npm run preview
```

Deploy to Cloudflare:

```bash
npm run deploy
```

### Environment / Configuration

Configure the D1 database binding and `BETTER_AUTH_URL` in `wrangler.jsonc`,
and set the `BETTER_AUTH_SECRET` secret (e.g. via `wrangler secret put
BETTER_AUTH_SECRET`) before deploying.

`BETTER_AUTH_URL` **must** match the exact origin your app is served from in
production (e.g. `https://your-worker-name.your-subdomain.workers.dev` or a
custom domain), otherwise sign-in/sign-up requests will fail with an
`Invalid origin` error. If you need to trust additional origins (for example
while migrating domains), set the optional `BETTER_AUTH_TRUSTED_ORIGINS`
variable to a comma-separated list of extra origins. Local development
origins (`http://localhost:5173` and `http://localhost:8787`) are always
trusted automatically.

### Seeding Initial Users

After applying migrations, you can seed the database with one active user per
role (`admin` and `partner`) so you can sign in right away:

```bash
npm run db:seed:generate   # (re)generates drizzle/seed/seed.sql with fresh hashed passwords
npm run db:seed            # applies drizzle/seed/seed.sql to the local D1 database
npm run db:seed:remote     # applies drizzle/seed/seed.sql to the remote/production D1 database
```

Seeded accounts (all use the password `garland123`):

| Email | Role |
| --- | --- |
| `admin@example.com` | admin |
| `partner@example.com` | partner |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build the client and worker for production |
| `npm run preview` | Build then run locally with Wrangler |
| `npm run deploy` | Build then deploy to Cloudflare |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check both client and worker TypeScript configs |
| `npm run test:unit` | Run unit tests with Vitest |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run db:generate` | Generate Drizzle migrations from the schema |
| `npm run db:seed:generate` | Regenerate `drizzle/seed/seed.sql` with fresh hashed passwords |
| `npm run db:seed` | Seed the local D1 database with initial users |
| `npm run db:seed:remote` | Seed the remote/production D1 database with initial users |

## Frontend Design Guidelines

By default, AI-generated frontends tend to converge on the same generic look
(Inter font, purple gradients, the same rounded cards everywhere). To avoid
that, this repo ships a `@frontend-design-expert` custom agent persona
(`.github/agents/frontend-design-expert.agent.md`) that Copilot follows when
creating or restyling anything under `src/frontend/`. It requires picking a
deliberate aesthetic direction, using cohesive design tokens/typography
instead of one-off hardcoded values, and keeping accessibility (contrast,
focus states, keyboard/screen-reader support) non-negotiable. See
[AGENT.md](./AGENT.md#specialized-agent-directory) for the full list of
specialized agents and when each one is invoked.

The agent is backed by a real
[GitHub Copilot agent skill](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills),
`.github/skills/frontend-design/SKILL.md`, ported from the
[Claude Code Frontend Design Toolkit](https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit)
ecosystem (specifically Anthropic's official `frontend-design` skill). We're
explicit about what was ported and how to refresh it as the upstream
toolkit/skills evolve — see
[`.github/skills/SOURCES.md`](./.github/skills/SOURCES.md) for the exact
upstream source, commit reference, and update steps.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions on the initial Cloudflare
deployment and how Continuous Deployment to Cloudflare works on merge to `main`.

## Copying This Repo for a New Project

This repository is a boilerplate, meant to be copied as the starting point
for new projects. See [COPY_THIS_REPO.md](./COPY_THIS_REPO.md) for a full,
step-by-step guide covering what to copy, how to set up your own Cloudflare
account/resources, and exactly which Cloudflare/GitHub secrets you must
create for CI/CD to work.

## Non-Technical Owner Workflow (No Code / No Terminal)

For non-technical business users, daily use and change requests should happen
through two interfaces only: the live web app and GitHub Issues.

### 1) Day-to-day operations (zero code / zero GitHub)

- **Partners**: Bookmark
  `https://dashboard.garlandk.workers.dev`, log in, and use
  forms/tables to submit and view referrals.
- **Owner/Admin**: Log in to the same URL, open `/admin`, and approve users or
  update referral statuses directly in the UI.

### 2) Requesting changes (plain-English issue to deployment loop)

```
Non-Technical Owner                AI Cloud Agent                 GitHub Actions
┌──────────────────┐             ┌──────────────────┐           ┌──────────────────┐
│  Opens GitHub    │             │  Reads issue &   │           │  Runs CI tests,  │
│  Issue in plain  │ ──────────> │  creates PR with │ ────────> │  merges code, &  │
│  English         │             │  code changes    │           │  deploys live    │
└──────────────────┘             └──────────────────┘           └──────────────────┘
```

Step-by-step:

1. **Submit a request (GitHub Issue)**  
   Example:  
   > "Add a 'Phone Number' column to the Admin referral table so I can call clients directly from the table."
2. **AI agent implements it**  
   A cloud agent (for example GitHub Copilot Workspace, Devin, or an
   issue-triggered bot) reads the issue + `AGENT.md`, writes code, and opens a
   PR.
3. **GitHub Actions verifies it**  
   CI runs linting, unit tests, and Playwright E2E tests on the PR.
4. **One-click publish**  
   Click **Merge pull request** when checks are green; CI/CD applies database
   changes and deploys the live Cloudflare site.

### 3) Recommended non-technical tools

- **GitHub Copilot Workspace (web)**: describe changes in plain English, preview
  updates, then click **Create PR**.
- **Cursor (desktop)**: press `Cmd+I` / `Ctrl+I`, describe the change in plain
  text, and let the agent handle git operations.

### 4) Owner safety checklist

- Never edit repository files manually on GitHub; always open an Issue (or ask
  an AI agent to do it).
- Never merge a PR with red checks. If CI fails, comment:
  `@copilot fix the CI build errors in the PR comment thread`.
- Only click **Merge** when checks are green.
