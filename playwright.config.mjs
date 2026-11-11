import { defineConfig } from '@playwright/test'

// Local servers must bypass any system HTTP proxy during browser checks.
const localBypass = [process.env.NO_PROXY, process.env.no_proxy, 'localhost', '127.0.0.1'].filter(Boolean).join(',')
process.env.NO_PROXY = localBypass
process.env.no_proxy = localBypass

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 4,
  use: {
    baseURL: 'http://127.0.0.1:5175',
    viewport: { width: 390, height: 844 },
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    },
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5175 --strictPort',
    url: 'http://127.0.0.1:5175',
    reuseExistingServer: false,
  },
})
