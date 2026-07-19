import { defineConfig, devices } from "@playwright/test";

// The suite serves a fresh static export rather than reusing whatever listens
// on the dev port: a dev server from another checkout used to answer instead,
// silently testing the wrong code. Port 3123 keeps `npm run dev` on 3000 usable
// alongside a run — `next dev` refuses a second instance per project directory.
const port = Number(process.env.E2E_PORT ?? 3123);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run build && npx serve out --listen ${port} --no-clipboard`,
    url: baseURL,
    reuseExistingServer: false,
  },
});
