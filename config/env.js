// 比照 cms/apps/admin/config/env.js，只保留本專案用到的設定
const appEnv = {
  /**
   * 根路徑設置：BPM 靜態網頁空間的放置路徑，未設定時為根目錄
   */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
};

module.exports = { appEnv };
