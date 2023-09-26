import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 40 * 1000,
  fullyParallel: true,
  retries: 0,
  workers: 1,
  reporter: [["line"], ["allure-playwright", { outputFile: "allure-results" }]],
  use: {
    baseURL: "https://enotes.pointschool.ru",
    viewport: { width: 1920, height: 1080 },
    screenshot: "on",
    trace: "off"
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
