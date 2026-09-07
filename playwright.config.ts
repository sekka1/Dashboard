import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:8787",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run preview",
    url: "http://localhost:8787",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
