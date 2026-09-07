# Cloudflare Deployment Guide

This document describes how to perform the initial (one-time) manual deployment
of this application to Cloudflare, and how automatic Continuous Deployment (CD)
works once that setup is complete.

## 1. Prerequisites

- A Cloudflare account with Workers and D1 enabled.
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (already
  included as a dev dependency, available via `npx wrangler`).
- A Cloudflare API Token with permissions to edit Workers Scripts and D1
  databases, and your Cloudflare Account ID.

## 2. One-Time Initial Setup

### Step A: Authenticate Wrangler

```bash
npx wrangler login
```

### Step B: Create the production D1 database

```bash
npx wrangler d1 create referral-portal-db
```

Note the `database_id` returned in the output.

### Step C: Update `wrangler.jsonc`

Replace the placeholder `database_id` in `wrangler.jsonc` with the ID from the
previous step:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "referral-portal-db",
    "database_id": "<your-database-id-here>",
    "migrations_dir": "drizzle"
  }
]
```

### Step D: Apply database migrations

```bash
npx wrangler d1 migrations apply referral-portal-db --remote
```

### Step E: Set `BETTER_AUTH_URL` to your deployed Worker URL

Update the `vars.BETTER_AUTH_URL` value in `wrangler.jsonc` to match the
exact origin your Worker will be served from, e.g.
`https://dashboard.<your-subdomain>.workers.dev` (or your
custom domain). Better Auth performs strict origin validation, so if this
value still points at `http://localhost:8787` when deployed, sign-in and
sign-up requests will fail with an `Invalid origin` error.

If you also need to trust other origins (for example during a domain
migration), set the optional `BETTER_AUTH_TRUSTED_ORIGINS` variable to a
comma-separated list of additional origins.

### Step F: Build and deploy the application

```bash
npm run deploy
```

This runs `npm run build` followed by `wrangler deploy`, which builds the
client/worker bundle and publishes it to Cloudflare Workers.

## 3. Continuous Deployment (GitHub Actions)

Once the initial setup above is complete, the workflow defined in
[`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) automatically
deploys every push to the `main` branch (for example, when a pull request is
merged). The workflow:

1. Installs dependencies.
2. Applies any pending D1 migrations to the production database.
3. Builds the application.
4. Deploys the Worker (and static assets) via `wrangler deploy`.

### Required GitHub Secrets

Configure the following repository (or environment) secrets under
**Settings → Secrets and variables → Actions** so the CD workflow can
authenticate with Cloudflare:

| Secret                  | Description                                              |
| ------------------------ | --------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`   | API token with Workers Scripts and D1 edit permissions.   |
| `CLOUDFLARE_ACCOUNT_ID`  | Your Cloudflare account ID.                               |
| `SENSOR_API_TOKEN`       | Shared secret garden sensors must send to `POST /data`. The deploy workflow pushes this to the Worker via `wrangler secret put` on every deploy. |

Once these secrets are configured, merging to `main` will automatically run
database migrations and deploy the latest code to Cloudflare.

### Post-deploy E2E smoke test

After the Worker is deployed, the workflow runs a small Playwright smoke test
suite ([`e2e-live/smoke.spec.ts`](./e2e-live/smoke.spec.ts)) against the
**live** deployment to confirm the main page is reachable and that a real
user can sign in. It uses the `partner@example.com` user seeded by
[`scripts/seed-users.mjs`](./scripts/seed-users.mjs) (see
[`drizzle/seed/seed.sql`](./drizzle/seed/seed.sql)) by default, so make sure
that user has been seeded into the remote database (see the "Seed Remote D1
Database" workflow) before relying on this check.

The `E2E_TEST_PASSWORD` secret must be configured for the sign-in smoke test
to run — it is never hardcoded in source, and the test is skipped if it is
missing.

| Name                  | Type   | Required | Description                                              |
| ---------------------- | ------ | -------- | --------------------------------------------------------- |
| `LIVE_URL`              | variable | No | Base URL of the deployed site (defaults to `https://dashboard.garlandk.workers.dev`). |
| `E2E_TEST_EMAIL`        | secret | No | Email of the test user used to sign in (defaults to `partner@example.com`). |
| `E2E_TEST_PASSWORD`     | secret | Yes | Password of the test user used to sign in.                |

To run the same suite locally against a live URL:

```bash
LIVE_URL=https://dashboard.garlandk.workers.dev \
E2E_TEST_EMAIL=partner@example.com \
E2E_TEST_PASSWORD=<your-test-password> \
npm run test:e2e:live
```
