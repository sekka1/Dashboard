import { defineConfig } from "@playwright/test";

// Runs a small smoke test suite against the *deployed* live site (as opposed
// to `playwright.config.ts`, which spins up a local preview server). This is
// intended to be run as a post-deploy step in CI after publishing to
// Cloudflare Workers, but can also be run manually:
//
//   LIVE_URL=https://real-estate-referral-portal.garlandk.workers.dev \
//   E2E_TEST_EMAIL=partner@example.com \
//   E2E_TEST_PASSWORD=<your-test-password> \
//   npm run test:e2e:live
//
// This is a boilerplate project, so no environment-specific URL is
// hardcoded here - `LIVE_URL` must always be provided (e.g. via a GitHub
// Actions repository/environment variable). See AGENT.md for guidance on
// where environment-specific, non-secret values like this should live.
if (!process.env.LIVE_URL) {
  throw new Error(
    "LIVE_URL environment variable must be set to run the live E2E smoke tests " +
      "(e.g. LIVE_URL=https://your-app.workers.dev npm run test:e2e:live).",
  );
}

export default defineConfig({
  testDir: "./e2e-live",
  fullyParallel: true,
  retries: 2,
  reporter: [["html", { open: "never", outputFolder: "playwright-report-live" }]],
  use: {
    baseURL: process.env.LIVE_URL,
    trace: "on-first-retry",
  },
});
