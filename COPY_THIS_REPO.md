# How to Copy This Boilerplate for a New Project

This repository is designed to be a reusable boilerplate. This guide describes
exactly what to copy, and the step-by-step setup required (including which
Cloudflare secrets to create) so a brand-new project — created by a human or
an AI coding agent — works from the first push.

## 1. What to Copy

Copy **everything** in this repository into the new repo, including the
"hidden"/dotfile directories that are easy to miss:

- `.github/**` — CI/CD workflows (`.github/workflows/`), issue templates
  (`.github/ISSUE_TEMPLATE/`), specialized agent definitions
  (`.github/agents/`), and Copilot agent skills (`.github/skills/`)
- `AGENT.md` — the agent execution rules/security protocols that keep an AI
  coding agent operating safely on this codebase
- `COPY_THIS_REPO.md` — this file, so the new repo can be copied again later
- `README.md`, `DEPLOYMENT.md`
- All application source: `src/`, `e2e/`, `e2e-live/`, `drizzle/`, `scripts/`
- All config files at the repo root: `package.json`, `package-lock.json`,
  `tsconfig*.json`, `vite.config.ts`, `vitest.config.ts`,
  `playwright*.config.ts`, `wrangler.jsonc`, `drizzle.config.ts`,
  `eslint.config.js`, `tailwind.config.js`, `postcss.config.js`,
  `index.html`, `.gitignore`

In short: clone or copy the entire repository as-is, then follow the steps
below to make it your own.

## 2. Step-by-Step Setup for a New Project

### Step 1: Create the new repository

Copy this repo's contents into a new GitHub repository (for example, use
"Use this template" if enabled, or `git clone` this repo and push it to a new
remote).

### Step 2: Rename project-specific values

Update these project-specific identifiers to match your new project:

- `package.json`: `name` field
- `wrangler.jsonc`: the top-level `name` (Worker name) and the
  `d1_databases[].database_name` value
- `README.md` / `DEPLOYMENT.md`: replace references to
  `real-estate-referral-portal` and the "Real Estate Referral Portal" domain
  description with your own project name and description

### Step 3: Install dependencies and verify locally

```bash
npm install
npm run lint
npm run typecheck
npm run test:unit
```

### Step 4: Create Cloudflare resources

1. [Sign up / log in](https://dash.cloudflare.com/) to Cloudflare and enable
   **Workers** and **D1** on your account.
2. Authenticate Wrangler locally: `npx wrangler login`.
3. Create a new D1 database: `npx wrangler d1 create <your-database-name>`.
4. Copy the returned `database_id` into `wrangler.jsonc`
   (`d1_databases[0].database_id`).
5. Apply migrations to the new database:
   `npx wrangler d1 migrations apply <your-database-name> --remote`.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full details on each of these steps.

### Step 5: Create a Cloudflare API Token

1. In the Cloudflare dashboard, go to **My Profile → API Tokens → Create
   Token**.
2. Create a token with permissions to edit **Workers Scripts** and **D1**
   databases for your account.
3. Note the token value and your **Account ID** (visible on the Workers
   Overview page in the Cloudflare dashboard) — both are needed in Step 6.

### Step 6: Configure GitHub repository secrets and variables

In the new GitHub repo, go to **Settings → Secrets and variables → Actions**
and add the following. **All of these MUST be set for CI/CD to work:**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | Secret | **Yes** | The API token created in Step 5. Used by the deploy and seed-remote-db workflows to authenticate with Cloudflare. |
| `CLOUDFLARE_ACCOUNT_ID` | Secret | **Yes** | Your Cloudflare account ID from Step 5. |
| `BETTER_AUTH_SECRET` | Cloudflare Worker secret (not a GitHub secret) | **Yes** | Set directly on the Worker with `npx wrangler secret put BETTER_AUTH_SECRET` — used by `better-auth` to sign sessions. This is not read by GitHub Actions, so it does not go in GitHub secrets. |
| `LIVE_URL` | Variable (`vars`) | No | Base URL of the deployed site, used by the post-deploy smoke tests. Defaults to the boilerplate's demo URL if unset — set this to your own deployed Worker URL. |
| `E2E_TEST_EMAIL` | Secret | No | Email of a seeded test user used for the post-deploy sign-in smoke test. Defaults to `partner@example.com`. |
| `E2E_TEST_PASSWORD` | Secret | **Yes** (for smoke test) | Password of the test user above. The sign-in smoke test is skipped if this is not set. |

### Step 7: Update application configuration

1. In `wrangler.jsonc`, set `vars.BETTER_AUTH_URL` to the exact origin your
   Worker will be served from (e.g.
   `https://<your-worker-name>.<your-subdomain>.workers.dev`, or a custom
   domain). This **must** match exactly or sign-in/sign-up will fail with an
   `Invalid origin` error.
2. Set the `BETTER_AUTH_SECRET` Worker secret (Step 6 above) before your first
   deploy:
   ```bash
   npx wrangler secret put BETTER_AUTH_SECRET
   ```

### Step 8: Deploy

Push to your default branch (e.g. `main`). Once the GitHub secrets from Step
6 are configured, the [`deploy.yml`](./.github/workflows/deploy.yml) workflow
will automatically apply database migrations, build, and deploy the Worker.

You can also deploy manually the first time:

```bash
npm run deploy
```

### Step 9 (Optional): Seed initial users

```bash
npm run db:seed:generate
npm run db:seed:remote
```

Or trigger the "Seed Remote D1 Database" GitHub Actions workflow.

## 3. Keeping the Boilerplate Updated

This project may spawn other projects, and this boilerplate itself may
receive general-purpose improvements over time (CI/CD changes, new
`.github/agents` specialists, new reusable patterns, etc.). When you have a
generally-useful improvement that isn't specific to one spawned project's
business logic, consider contributing it back to this boilerplate repo using
the **"🧰 Add a Boilerplate Feature"** issue template
(`.github/ISSUE_TEMPLATE/boilerplate_feature.yml`) so future copies of this
repo benefit from it too.
