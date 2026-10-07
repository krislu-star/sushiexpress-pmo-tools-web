import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import nodemailer, { type Transporter } from 'nodemailer';
import { GROUPS } from '../../src/lib/pmo/snapshotSchema';
import {
  labelsOf,
  parseReport,
  REPORT_FILE,
  type UpdateReport,
} from './updateReport';

type Env = Record<string, string | undefined>;

/** SMTP 與收件設定（spec FR-005；plan 第 9 節）。 */
export interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  from: string;
  to: string[];
  user: string;
  pass: string;
}

const REQUIRED = [
  'PMO_NOTIFY_EMAIL',
  'PMO_SMTP_HOST',
  'PMO_SMTP_PORT',
  'PMO_SMTP_FROM',
  'PMO_SMTP_USER',
  'PMO_SMTP_PASSWORD',
] as const;

/** 讀取 SMTP 設定；缺漏時回傳缺少的名稱。465 使用 SSL，其餘（如 587）使用 STARTTLS。 */
export function smtpSettingsOf(env: Env): SmtpSettings | { missing: string[] } {
  const port = Number(env.PMO_SMTP_PORT);
  const missing = REQUIRED.filter(
    name =>
      !env[name]?.trim() ||
      (name === 'PMO_SMTP_PORT' && !Number.isInteger(port))
  );
  if (missing.length) return { missing };
  return {
    host: env.PMO_SMTP_HOST!,
    port,
    secure: port === 465,
    from: env.PMO_SMTP_FROM!,
    to: env
      .PMO_NOTIFY_EMAIL!.split(',')
      .map(s => s.trim())
      .filter(Boolean),
    user: env.PMO_SMTP_USER!,
    pass: env.PMO_SMTP_PASSWORD!,
  };
}

/** workflow 執行紀錄連結（有 GitHub 環境變數時）。 */
function runUrlOf(env: Env): string | null {
  const {
    GITHUB_SERVER_URL: server,
    GITHUB_REPOSITORY: repo,
    GITHUB_RUN_ID: run,
  } = env;
  return server && repo && run ? `${server}/${repo}/actions/runs/${run}` : null;
}

/** 網站上案件追蹤頁的網址（有 PMO_SITE_URL 時）。 */
function siteLineOf(env: Env): string[] {
  const site = env.PMO_SITE_URL?.trim();
  if (!site) return [];
  return [
    `網站：${new URL('tracker', site.endsWith('/') ? site : `${site}/`)}`,
  ];
}

/** 成功或有警告時的產出說明（網站網址、artifact 名稱）；失敗時說明維持上一版。 */
function outcomeOf(report: UpdateReport, counts: string, env: Env): string[] {
  if (report.status === 'failed') return ['本次未產出新版，線上維持上一版。'];
  return [
    `已產出新版；各分頁件數：${counts}。`,
    ...siteLineOf(env),
    `可交付的頁面檔案：pmo-site-${report.capturedAt}（於執行紀錄頁下載）。`,
  ];
}

/**
 * 產生通知郵件（每次更新皆寄送，spec FR-005、SC-011）。內容只含報告資訊，不含任何 Secret（含存取密碼）。
 */
export function notificationOf(
  report: UpdateReport,
  env: Env
): { subject: string; text: string } {
  const labels = labelsOf(report);
  const date = report.capturedAt ?? report.startedAt.slice(0, 10);
  const counts = report.counts
    ? GROUPS.map(g => `${g} ${report.counts![g]}`).join('、')
    : '—';
  const runUrl = runUrlOf(env);
  const lines = [
    `工作表更新${labels.status}（${labels.trigger}觸發，${report.startedAt}）。`,
    ...outcomeOf(report, counts, env),
    ...(report.errors.length
      ? ['', '錯誤：', ...report.errors.map(e => `- ${e}`)]
      : []),
    ...(report.warnings.length
      ? ['', '警告：', ...report.warnings.map(w => `- ${w}`)]
      : []),
    ...(runUrl ? ['', `執行紀錄：${runUrl}`] : []),
  ];
  return {
    subject: `[爭鮮 PMO] 工作表更新${labels.status}（${date}）`,
    text: lines.join('\n'),
  };
}

type CreateTransport = (options: object) => Pick<Transporter, 'sendMail'>;

/** 依報告寄送通知；未設定 SMTP 時略過並回傳原因。 */
export async function sendNotification(
  report: UpdateReport,
  env: Env,
  createTransport: CreateTransport = nodemailer.createTransport
): Promise<{ sent: true; to: string[] } | { sent: false; reason: string }> {
  const mail = notificationOf(report, env);
  const settings = smtpSettingsOf(env);
  if ('missing' in settings)
    return {
      sent: false,
      reason: `未設定通知：缺少 ${settings.missing.join('、')}`,
    };
  const transport = createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: { user: settings.user, pass: settings.pass },
  });
  await transport.sendMail({
    from: settings.from,
    to: settings.to,
    subject: mail.subject,
    text: mail.text,
  });
  return { sent: true, to: settings.to };
}

/**
 * CLI：讀取 update-report.json 並寄送通知。
 * @returns 結束碼：寄出或略過 0，讀取或寄送失敗 1
 */
export async function main(
  cwd: string,
  env: Env,
  createTransport?: CreateTransport
): Promise<number> {
  try {
    const report = parseReport(
      JSON.parse(readFileSync(join(cwd, REPORT_FILE), 'utf8'))
    );
    const result = await sendNotification(report, env, createTransport);
    console.log(
      result.sent ? `已寄出通知給 ${result.to.join('、')}` : result.reason
    );
    return 0;
  } catch (error) {
    console.error(`通知失敗：${(error as Error).message}`);
    return 1;
  }
}

/* istanbul ignore next -- CLI 進入點 */
if (require.main === module) {
  main(process.cwd(), process.env).then(code => (process.exitCode = code));
}
