import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const PERF_PORT = 4175;
const PERF = !!process.env.PMO_PERF;

/**
 * E2E 以建置後的靜態檔執行，只測 Chrome（spec NFR-004）。測試不依賴真實資料：
 * 一般：以固定測試快照建置的 `out-e2e/`（pnpm build:e2e）；
 * 效能：設定 PMO_PERF=1，使用 500 件合成快照的 `out-perf/`（pnpm build:perf）。
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { trace: 'on-first-retry' },
  projects: PERF
    ? [
        {
          name: 'perf',
          testMatch: /performance\.spec\.ts/,
          use: {
            ...devices['Desktop Chrome'],
            baseURL: `http://localhost:${PERF_PORT}`,
          },
        },
      ]
    : [
        {
          name: 'chrome',
          testIgnore: /performance\.spec\.ts/,
          use: {
            ...devices['Desktop Chrome'],
            baseURL: `http://localhost:${PORT}`,
          },
        },
        {
          name: 'mobile-chrome',
          testIgnore: /performance\.spec\.ts/,
          use: { ...devices['Pixel 7'], baseURL: `http://localhost:${PORT}` },
        },
      ],
  webServer: {
    command: `pnpm exec tsx scripts/serve-static.ts ${PERF ? 'out-perf' : process.env.PMO_E2E_READONLY ? 'out-e2e-readonly' : 'out-e2e'} ${PERF ? PERF_PORT : PORT}`,
    port: PERF ? PERF_PORT : PORT,
    // 唯讀建置使用不同的輸出目錄，不可沿用一般 E2E 的伺服器
    reuseExistingServer: !process.env.CI && !process.env.PMO_E2E_READONLY,
  },
});
