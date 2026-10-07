/** @type {import('next').NextConfig} */

const { appEnv } = require('./config/env');

const nextConfig = {
  // 產出純靜態檔放入 BPM 靜態網頁空間（001 plan ADR-002）
  output: 'export',
  // 輸出 tracker.html 而非 tracker/index.html，檔名與 PoC 相同
  trailingSlash: false,
  basePath: appEnv.basePath,
  // 僅供測試建置：輸出到其他資料夾（靜態匯出時 distDir 即輸出目錄）
  ...(process.env.PMO_OUT_DIR ? { distDir: process.env.PMO_OUT_DIR } : {}),
  reactStrictMode: true,
  images: { unoptimized: true },
};

module.exports = nextConfig;
