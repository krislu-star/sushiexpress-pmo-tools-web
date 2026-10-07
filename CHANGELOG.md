# Changelog

## 0.2.0 — 2026-09-23

對應 speckit `specs/002-pmo-data-sync-and-access/`。

### 新增

- 工作表自動更新：GitHub Actions「更新工作表資料」每天台北 09:00 與手動觸發；以服務帳號唯讀讀取四個分頁（`pnpm snapshot:fetch`），沿用快照 v2 驗證
- 共用密碼存取保護：建置前加密（PBKDF2-SHA256 600,000 次＋AES-256-GCM），頁面只含密文；瀏覽器輸入密碼解密，同分頁三頁共用金鑰
- 更新報告：GitHub 執行摘要、`update-report.json`；失敗或有警告時寄 Email
- 可交付頁面檔案以 artifact `pmo-site-YYYY-MM-DD` 保留 30 天

### 變更

- 真實快照不再進版控；`data/snapshot.config.json` 改為 v2（試算表 ID＋分頁名稱）
- `pnpm build` 會先執行 `snapshot:encrypt`；CI 以測試快照與測試密碼建置
- 新增 `check:plaintext`：產物中不得出現案件名稱、負責人或 LOG 片段

### 已知事項

- 交付 BPM 仍需人工上傳 artifact（自動上傳待維運提供管道）
- 會議頁本機紀錄為明文，不受密碼保護

## 0.1.0 — 2026-09-23

首版，對應 speckit `specs/001-pmo-dashboard/`。

### 新增

- 三個靜態頁：`tracker.html`（IT 案件追蹤）、`management.html`（主管專案面板、工作列表、逐案呈報、A4 報告）、`meeting.html`（IT 內部會議燈號）
- 工作表快照 v2（每列 15 欄，含 Progress 與燈號）與 `pnpm snapshot:build` 轉換 CLI
- 完成度與會議預設燈號取自原表；會議修改只存本機（`sushi-pmo-meeting-v1`）
- A4 列印：專案每頁 2 個、案件每頁 3 件；拖曳與鍵盤排序
- 資料：2026/09/16 工作表快照，四組 77 件

### 品質

- 產物不含可執行行內腳本（`pnpm check:inline`，CI 檢查）
- Jest（整體 ≥ 80%、`src/lib/pmo` 100%）、Playwright（CSP、PDF、axe、手機版面）、500 件效能測試

### 已知事項

- Frontend、BPM、SAP 分頁尚無 Progress／燈號欄，暫視為空白
- 試算表 ID／gid 沿用 PoC 設定
- 尚未於 BPM 實測 iframe 列印
