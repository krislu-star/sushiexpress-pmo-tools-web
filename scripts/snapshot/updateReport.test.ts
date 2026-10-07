/**
 * @jest-environment node
 */
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sample from '../../tests/fixtures/snapshot.sample.json';
import { parseSnapshot } from '@/lib/pmo/snapshotSchema';
import {
  createReport,
  finalize,
  parseReport,
  reportSchema,
  reportToMarkdown,
  triggerOf,
} from './updateReport';

const snapshot = parseSnapshot(sample);
const times = {
  startedAt: '2026-09-23T01:00:00.000Z',
  finishedAt: '2026-09-23T01:00:05.000Z',
};

describe('triggerOf', () => {
  it('schedule 為排程，其餘視為手動', () => {
    expect(triggerOf('schedule')).toBe('schedule');
    expect(triggerOf('workflow_dispatch')).toBe('manual');
    expect(triggerOf(undefined)).toBe('manual');
  });
});

describe('createReport（spec FR-012、NFR-006）', () => {
  it('無警告時為 success，含擷取日期與各分頁件數', () => {
    const report = createReport({
      trigger: 'schedule',
      ...times,
      snapshot,
      warnings: [],
      errors: [],
    });
    expect(report).toEqual({
      trigger: 'schedule',
      ...times,
      status: 'success',
      capturedAt: '2026-09-15',
      counts: { Frontend: 4, Project: 4, BPM: 4, SAP: 4 },
      warnings: [],
      errors: [],
    });
    expect(parseReport(report)).toEqual(report);
  });

  it('有警告時為 warning（SC-004）', () => {
    const report = createReport({
      trigger: 'manual',
      ...times,
      snapshot,
      warnings: ['SAP 分頁尚未有 Progress 與燈號欄'],
      errors: [],
    });
    expect(report.status).toBe('warning');
  });

  it('有錯誤或沒有快照時為 failed，件數與日期為 null（SC-003、SC-005）', () => {
    const report = createReport({
      trigger: 'schedule',
      ...times,
      snapshot: null,
      warnings: [],
      errors: ['HTTP 403'],
    });
    expect(report).toMatchObject({
      status: 'failed',
      capturedAt: null,
      counts: null,
    });
  });

  it('reportSchema 可直接使用', () => {
    expect(reportSchema.safeParse({}).success).toBe(false);
  });

  it('格式不符時 parseReport 拋錯', () => {
    expect(() => parseReport({ trigger: 'cron' })).toThrow(/update-report/);
  });
});

describe('reportToMarkdown（Job Summary）', () => {
  it('列出狀態、觸發方式、件數、警告與錯誤', () => {
    const md = reportToMarkdown(
      createReport({
        trigger: 'schedule',
        ...times,
        snapshot,
        warnings: ['SAP 缺欄'],
        errors: [],
      })
    );
    expect(md).toContain('## 工作表更新：有警告');
    expect(md).toContain('排程');
    expect(md).toContain('| Frontend | 4 |');
    expect(md).toContain('- SAP 缺欄');
    const failed = reportToMarkdown(
      createReport({
        trigger: 'manual',
        ...times,
        snapshot: null,
        warnings: [],
        errors: ['HTTP 403'],
      })
    );
    expect(failed).toContain('## 工作表更新：失敗');
    expect(failed).toContain('手動');
    expect(failed).toContain('- HTTP 403');
    expect(failed).not.toContain('| Frontend |');
  });
});

describe('finalize（workflow 收尾）', () => {
  function dir() {
    return mkdtempSync(join(tmpdir(), 'report-'));
  }

  it('後續步驟失敗時將成功報告改為 failed，並寫入 Job Summary', () => {
    const cwd = dir();
    const summary = join(cwd, 'summary.md');
    writeFileSync(
      join(cwd, 'update-report.json'),
      JSON.stringify(
        createReport({
          trigger: 'schedule',
          ...times,
          snapshot,
          warnings: [],
          errors: [],
        })
      )
    );
    const report = finalize(cwd, {
      jobStatus: 'failure',
      summaryPath: summary,
      now: () => new Date(times.finishedAt),
      trigger: 'schedule',
    });
    expect(report.status).toBe('failed');
    expect(report.errors).toContain(
      '建置或檢查步驟失敗，請查看 workflow 執行紀錄'
    );
    expect(
      JSON.parse(readFileSync(join(cwd, 'update-report.json'), 'utf8')).status
    ).toBe('failed');
    expect(readFileSync(summary, 'utf8')).toContain('## 工作表更新：失敗');
  });

  it('成功時維持原報告；沒有報告檔時建立失敗報告', () => {
    const cwd = dir();
    const ok = createReport({
      trigger: 'manual',
      ...times,
      snapshot,
      warnings: [],
      errors: [],
    });
    writeFileSync(join(cwd, 'update-report.json'), JSON.stringify(ok));
    expect(
      finalize(cwd, {
        jobStatus: 'success',
        now: () => new Date(),
        trigger: 'manual',
      })
    ).toEqual(ok);
    const empty = dir();
    const created = finalize(empty, {
      jobStatus: 'failure',
      now: () => new Date(times.finishedAt),
      trigger: 'schedule',
    });
    expect(created).toMatchObject({
      status: 'failed',
      trigger: 'schedule',
      counts: null,
    });
    expect(created.errors[0]).toContain('未產生更新報告');
  });
});
