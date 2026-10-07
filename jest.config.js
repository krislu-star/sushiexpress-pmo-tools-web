const nextJest = require('next/jest');

// 載入 next.config.js 與 .env，並以 SWC 轉譯 TS/TSX（比照 cms）
const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // 測試一律使用固定測試快照，不依賴真實資料（plan 002 ADR-007）
    '^/data/snapshot\\.json$': '<rootDir>/tests/fixtures/snapshot.sample.json',
    '^/data/(.*)$': '<rootDir>/data/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/e2e/',
    '<rootDir>/out/',
    '<rootDir>/.next/',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'scripts/**/*.ts',
    // 頁面檔只組裝元件，由 E2E 覆蓋；邏輯放在 src/components 與 src/lib
    '!src/pages/**',
    // 複製自 cms 的元件庫（ADR-003），視同第三方程式碼，只以 smoke test 驗證
    '!src/components/ui/**',
    '!**/*.test.{ts,tsx}',
    '!**/*.d.ts',
  ],
  // Article III：unit 80%；關鍵路徑（src/lib/pmo：資料轉換、篩選排序、會議儲存、分頁）100%
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
    './scripts/snapshot/': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/lib/pmo/': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
