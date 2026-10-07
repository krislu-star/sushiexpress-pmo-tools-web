import {
  appendFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { GROUPS, type Snapshot } from '../../src/lib/pmo/snapshotSchema';

const countsSchema = z
  .object({
    Frontend: z.number().int(),
    Project: z.number().int(),
    BPM: z.number().int(),
    SAP: z.number().int(),
  })
  .strict();

/** 更新報告；與 specs/002-pmo-data-sync-and-access/contracts/update-report.schema.json 一致。 */
export const reportSchema = z
  .object({
    trigger: z.enum(['schedule', 'manual']),
    startedAt: z.string(),
    finishedAt: z.string(),
    status: z.enum(['success', 'warning', 'failed']),
    capturedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable(),
    counts: countsSchema.nullable(),
    warnings: z.array(z.string()),
    errors: z.array(z.string()),
  })
  .strict();

/** 更新報告。 */
export type UpdateReport = z.infer<typeof reportSchema>;
/** 觸發方式。 */
export type Trigger = UpdateReport['trigger'];

/** 報告檔名（位於工作目錄根）。 */
export const REPORT_FILE = 'update-report.json';

const STATUS_LABEL = {
  success: '成功',
  warning: '有警告',
  failed: '失敗',
} as const;
const TRIGGER_LABEL = { schedule: '排程', manual: '手動' } as const;

/** GitHub 事件名稱對應觸發方式：schedule 為排程，其餘為手動。 */
export function triggerOf(eventName: string | undefined): Trigger {
  return eventName === 'schedule' ? 'schedule' : 'manual';
}

/** 驗證報告格式。 */
export function parseReport(data: unknown): UpdateReport {
  const result = reportSchema.safeParse(data);
  if (!result.success)
    throw new Error(`update-report.json 格式不符：${result.error.message}`);
  return result.data;
}

/**
 * 建立報告：有錯誤或無快照為 failed，有警告為 warning，否則 success（spec FR-012、NFR-006）。
 */
export function createReport(input: {
  trigger: Trigger;
  startedAt: string;
  finishedAt: string;
  snapshot: Snapshot | null;
  warnings: string[];
  errors: string[];
}): UpdateReport {
  const { snapshot, warnings, errors } = input;
  const failed = errors.length > 0 || !snapshot;
  return {
    trigger: input.trigger,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    status: failed ? 'failed' : warnings.length ? 'warning' : 'success',
    capturedAt: failed ? null : snapshot.capturedAt,
    counts: failed
      ? null
      : (Object.fromEntries(
          GROUPS.map(g => [g, snapshot.sheets[g].rows.length])
        ) as UpdateReport['counts']),
    warnings,
    errors,
  };
}

/** 報告的中文標籤（供 Job Summary 與 Email 共用）。 */
export function labelsOf(report: UpdateReport) {
  return {
    status: STATUS_LABEL[report.status],
    trigger: TRIGGER_LABEL[report.trigger],
  };
}

/** 轉為 GitHub Actions Job Summary 的 Markdown。 */
export function reportToMarkdown(report: UpdateReport): string {
  const labels = labelsOf(report);
  const lines = [
    `## 工作表更新：${labels.status}`,
    '',
    `- 觸發方式：${labels.trigger}`,
    `- 開始：${report.startedAt}　結束：${report.finishedAt}`,
    `- 擷取日期：${report.capturedAt ?? '—'}`,
  ];
  if (report.counts) {
    lines.push(
      '',
      '| 分頁 | 件數 |',
      '|------|------|',
      ...GROUPS.map(g => `| ${g} | ${report.counts![g]} |`)
    );
  }
  if (report.errors.length)
    lines.push('', '### 錯誤', ...report.errors.map(e => `- ${e}`));
  if (report.warnings.length)
    lines.push('', '### 警告', ...report.warnings.map(w => `- ${w}`));
  return `${lines.join('\n')}\n`;
}

/**
 * workflow 收尾：讀取報告（沒有時建立失敗報告），後續步驟失敗時標為 failed，
 * 寫回報告並附加到 Job Summary。
 */
export function finalize(
  cwd: string,
  options: {
    jobStatus: string;
    trigger: Trigger;
    now: () => Date;
    summaryPath?: string;
  }
): UpdateReport {
  const path = join(cwd, REPORT_FILE);
  const now = options.now().toISOString();
  let report = existsSync(path)
    ? parseReport(JSON.parse(readFileSync(path, 'utf8')))
    : createReport({
        trigger: options.trigger,
        startedAt: now,
        finishedAt: now,
        snapshot: null,
        warnings: [],
        errors: [
          '未產生更新報告：讀取工作表前即失敗，請查看 workflow 執行紀錄',
        ],
      });
  if (options.jobStatus !== 'success' && report.status !== 'failed') {
    report = {
      ...report,
      status: 'failed',
      capturedAt: null,
      counts: null,
      finishedAt: now,
      errors: [
        ...report.errors,
        '建置或檢查步驟失敗，請查看 workflow 執行紀錄',
      ],
    };
  }
  writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`);
  if (options.summaryPath)
    appendFileSync(options.summaryPath, reportToMarkdown(report));
  return report;
}

/* istanbul ignore next -- CLI 進入點：pnpm snapshot:report <job-status> */
if (require.main === module) {
  const report = finalize(process.cwd(), {
    jobStatus: process.argv[2] ?? 'success',
    trigger: triggerOf(process.env.GITHUB_EVENT_NAME),
    now: () => new Date(),
    summaryPath: process.env.GITHUB_STEP_SUMMARY,
  });
  console.log(`更新報告：${labelsOf(report).status}`);
}
