// playwright.config.ts — real-browser E2E against a running app.
// Locally: `npx playwright test` reuses a dev server on :3000 (or starts one).
// CI: the e2e job builds, migrates + seeds a Postgres service, then runs
// `npm start` (see .github/workflows/ci.yml).
import { defineConfig, devices } from "@playwright/test";

// The specs and the Clerk helpers read the same env the app does.
try {
  process.loadEnvFile(".env");
} catch {
  // No .env (CI) — everything comes from the job environment.
}

const PORT = 3000;
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: process.env.CI ? "npm start" : "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
