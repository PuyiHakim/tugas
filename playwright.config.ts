import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e", fullyParallel: true, workers: process.env.CI ? 4 : 3, reporter: "list",
  expect: { timeout: 10_000 },
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: { command: "npm run dev -- --port 3100", url: "http://localhost:3100", reuseExistingServer: false, timeout: 120_000 },
});
