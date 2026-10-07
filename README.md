# sushiexpress-pmo-tools-web

爭鮮 IT 案件追蹤與管理層呈報儀表板（前端）。

- 規格：speckit repo 的 `specs/001-pmo-dashboard/`（頁面）與 `specs/002-pmo-data-sync-and-access/`（自動更新與存取保護）
- 技術：Next.js 14（Pages Router，靜態匯出）、React 18、TypeScript、Tailwind CSS 3；UI 元件複製自 `cms`（`cms@0a0a5e2c`）
- 頁面（開啟時需輸入共用存取密碼；同一瀏覽器分頁內輸入一次即可切換三頁）：

| 頁面                                                | 開發網址      | 建置產物              |
| --------------------------------------------------- | ------------- | --------------------- |
| IT 案件追蹤                                         | `/tracker`    | `out/tracker.html`    |
| 管理層呈報（專案面板、工作列表、逐案呈報、A4 報告） | `/management` | `out/management.html` |
| IT 內部會議（燈號）                                 | `/meeting`    | `out/meeting.html`    |

## 運作方式

```
每天台北 09:00、合併到 master 時（或手動）→ GitHub Actions「更新工作表資料」
  讀取工作表（服務帳號，唯讀）→ 驗證 → 以共用密碼加密 → 靜態建置
  → 檢查（無行內腳本、無明文）→ 發佈 GitHub Pages → 執行摘要＋Email（每次執行）
網站：GitHub Pages 網址（自訂網域於 repo Settings → Pages 設定；根網址自動轉到 /tracker）
```

- 產物只含密文；網址公開，但沒有密碼無法從頁面檔案讀出案件資料。
- 每次執行都寄 Email：成功時附各分頁件數、網站網址與 artifact 下載位置（不含存取密碼；收件人以逗號分隔可設多位）；讀取或驗證失敗時不發佈（網站維持上一版），Email 會指出分頁、列號、欄位與原值。
- 每次成功仍會保留 artifact「pmo-site-日期」（30 天），需要改放到 BPM 等其他空間時可直接下載使用。
- 真實快照不進版控（`data/snapshot.json`、`.pmo/`、`update-report.json` 皆列入 `.gitignore`）。

## 一次性設定

1. **服務帳號**：在 Google Cloud 建立專案 → 啟用 Google Sheets API → 建立服務帳號（不需專案角色）→ 建立 JSON 金鑰。將試算表以「檢視者」分享給服務帳號 email。
2. **本 repo → Settings → Secrets and variables → Actions**：

   | 類型     | 名稱                           | 內容                                                        |
   | -------- | ------------------------------ | ----------------------------------------------------------- |
   | Secret   | `GOOGLE_SERVICE_ACCOUNT_KEY`   | 服務帳號 JSON 金鑰完整內容                                  |
   | Secret   | `PMO_ACCESS_PASSWORD`          | 頁面共用密碼（正式上線前 ≥ 16 字元）                        |
   | Secret   | `PMO_SMTP_USER`                | SMTP 登入帳號                                               |
   | Secret   | `PMO_SMTP_PASSWORD`            | SMTP 密碼（Google Workspace／Gmail 使用應用程式密碼）       |
   | Variable | `PMO_NOTIFY_EMAIL`             | 通知收件人，多人以逗號分隔                                  |
   | Variable | `PMO_SMTP_HOST`                | `smtp.gmail.com`（Google Workspace）或 `smtp.office365.com` |
   | Variable | `PMO_SMTP_PORT`                | `465`（SSL）或 `587`（STARTTLS）                            |
   | Variable | `PMO_SMTP_FROM`                | 寄件人，例：`爭鮮 PMO 儀表板 <寄件地址>`                    |
   | Variable | `NEXT_PUBLIC_BASE_PATH`        | （選填）子路徑；使用自訂網域（網站根目錄）時不設定          |
   | Variable | `NEXT_PUBLIC_PMO_MEETING_EDIT` | （選填）設為 `true` 才開放會議頁編輯與存檔；未設定為唯讀    |

   SMTP 設定缺任何一項時仍會更新資料，只是不寄信，並在執行摘要標示「未設定通知」。

3. `data/snapshot.config.json`：試算表 ID 與四個分頁名稱（分頁 gid 由 API 自動取得）。
4. **GitHub Pages**：Settings → Pages → Source 選「GitHub Actions」；Custom domain 填自訂網域（DNS 設 CNAME 指向 `<帳號或組織>.github.io`）。第一次部署完成、憑證核發後勾選「Enforce HTTPS」。
   - 首次部署會自動建立 `github-pages` environment；若該 environment 限制了可部署分支，需允許 `master`。

## 日常操作

- **手動更新**：GitHub → Actions → 「更新工作表資料」→ Run workflow。
- **查看結果**：該次執行的 Summary（狀態、各分頁件數、警告、錯誤）；成功時網站已更新，也可下載 artifact `pmo-site-YYYY-MM-DD`。
- **更換共用密碼**：更新 Secret `PMO_ACCESS_PASSWORD` → 手動執行一次更新。新版發佈後舊密碼即無法開啟，已開啟的分頁需重新輸入。

## 開發

本機設定放在 `.env.local`（已列入 `.gitignore`）：`cp .env.example .env.local` 後填入。`snapshot:*` 指令與 `next dev`／`next build` 都會讀取它；GitHub Actions 不讀，正式排程一律使用 repo 的 Secrets／Variables。

```bash
nvm use                                              # Node.js 版本見 .nvmrc
pnpm install --frozen-lockfile
cp tests/fixtures/snapshot.sample.json data/snapshot.json   # 或 pnpm snapshot:fetch（.env.local 需有 GOOGLE_SERVICE_ACCOUNT_KEY）
pnpm dev                                             # 會先以 .env.local 的密碼執行 snapshot:encrypt；http://localhost:3000/tracker
```

更換 `.env.local` 的密碼或重新取得快照後，重新執行 `pnpm dev`（或 `pnpm snapshot:encrypt` 後重新整理頁面），否則頁面仍是舊密碼加密的內容。

常用指令：

| 指令                                                   | 用途                                                                        |
| ------------------------------------------------------ | --------------------------------------------------------------------------- |
| `pnpm test` / `pnpm test:coverage`                     | Jest（整體 ≥ 80%；`src/lib/pmo`、`scripts/snapshot` 100%）                  |
| `pnpm lint` / `pnpm check:types` / `pnpm format:check` | Lint（含單一函式 ≤ 50 行）、型別、格式                                      |
| `pnpm snapshot:fetch`                                  | 讀取工作表 → `data/snapshot.json` 與 `update-report.json`                   |
| `pnpm snapshot:build --captured-at YYYY-MM-DD`         | 備援：由 `data/raw/*.csv` 產生快照（CSV 流程需設定檔中的 `sheetId`）        |
| `pnpm snapshot:encrypt`                                | 以 `PMO_ACCESS_PASSWORD` 加密 → `.pmo/page-data.json`（`build` 會先執行）   |
| `pnpm build`                                           | 加密並靜態匯出到 `out/`                                                     |
| `pnpm check:inline` / `pnpm check:plaintext`           | 產物無可執行行內腳本／無明文案件資料                                        |
| `pnpm build:e2e` / `pnpm e2e`                          | 以測試快照與測試密碼建置 `out-e2e/`，Playwright 在禁止行內腳本的 CSP 下測試 |
| `pnpm build:perf` / `pnpm e2e:perf`                    | 500 件合成快照建置 `out-perf/` 並驗證效能                                   |

測試（Jest、E2E、效能）一律使用 `tests/fixtures/` 的測試快照與假的 Google／SMTP 服務，不需要任何 Secret。

## 注意事項

- 產物不含可執行的行內腳本；若改放在 BPM 等有 CSP 的空間，需允許同源 `script-src 'self'` 與 `style-src 'self'`。
- 網址公開：資料安全完全仰賴共用密碼，正式上線前請改用 ≥ 16 字元的強密碼。
- 會議頁預設**唯讀**：燈號一律取自工作表，不讀寫瀏覽器本機紀錄。設定 `NEXT_PUBLIC_PMO_MEETING_EDIT=true` 並重新建置後才可編輯；編輯內容只存在使用者瀏覽器（`localStorage` key `sushi-pmo-meeting-v1`），為明文、不回寫工作表、其他電腦不會同步。
- GitHub 排程在尖峰時段可能延遲數分鐘至十數分鐘。
