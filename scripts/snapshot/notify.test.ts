/**
 * @jest-environment node
 */
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import nodemailer from 'nodemailer';
import sample from '../../tests/fixtures/snapshot.sample.json';
import { parseSnapshot } from '@/lib/pmo/snapshotSchema';
import {
  main,
  notificationOf,
  sendNotification,
  smtpSettingsOf,
} from './notify';
import { createReport } from './updateReport';

const snapshot = parseSnapshot(sample);
const times = {
  startedAt: '2026-09-23T01:00:00.000Z',
  finishedAt: '2026-09-23T01:00:05.000Z',
};
const failed = createReport({
  trigger: 'schedule',
  ...times,
  snapshot: null,
  warnings: [],
  errors: ['Project 分頁第 10 列 Progress「約九成」無法辨識，應為 0%～100%'],
});
const warned = createReport({
  trigger: 'manual',
  ...times,
  snapshot,
  warnings: ['SAP 分頁尚未有 Progress 與燈號欄'],
  errors: [],
});
const ok = createReport({
  trigger: 'schedule',
  ...times,
  snapshot,
  warnings: [],
  errors: [],
});

const env = {
  PMO_NOTIFY_EMAIL: 'owner@example.com, pm@example.com',
  PMO_SMTP_HOST: 'smtp.example.com',
  PMO_SMTP_PORT: '465',
  PMO_SMTP_FROM: '爭鮮 PMO 儀表板 <bot@example.com>',
  PMO_SMTP_USER: 'bot@example.com',
  PMO_SMTP_PASSWORD: 'S3CRET-PASS',
  GITHUB_SERVER_URL: 'https://github.com',
  GITHUB_REPOSITORY: 'Kiitzu/sushiexpress-pmo-tools-web',
  GITHUB_RUN_ID: '42',
};

/** 以 JSON transport 取代 SMTP，並記錄建立 transport 時的設定。 */
function jsonTransport() {
  const options: unknown[] = [];
  const create = jest.fn((opts: unknown) => {
    options.push(opts);
    return nodemailer.createTransport({ jsonTransport: true });
  });
  return { create, options };
}

describe('notificationOf（spec FR-005）', () => {
  it('成功也通知：主旨標示成功與日期，內文含各分頁件數與執行紀錄（下載）連結（SC-011）', () => {
    const mail = notificationOf(ok, env);
    expect(mail.subject).toBe('[爭鮮 PMO] 工作表更新成功（2026-09-15）');
    expect(mail.text).toContain('Frontend 4、Project 4、BPM 4、SAP 4');
    expect(mail.text).toContain('排程');
    expect(mail.text).toContain(
      'https://github.com/Kiitzu/sushiexpress-pmo-tools-web/actions/runs/42'
    );
    expect(mail.text).toContain('pmo-site-2026-09-15');
    expect(mail.text).not.toContain('錯誤');
  });

  it('失敗：主旨含狀態與日期，內文含分頁、列號、原值與執行紀錄連結（SC-003）', () => {
    const mail = notificationOf(failed, env)!;
    expect(mail.subject).toBe('[爭鮮 PMO] 工作表更新失敗（2026-09-23）');
    expect(mail.text).toContain(
      'Project 分頁第 10 列 Progress「約九成」無法辨識'
    );
    expect(mail.text).toContain('線上維持上一版');
    expect(mail.text).toContain(
      'https://github.com/Kiitzu/sushiexpress-pmo-tools-web/actions/runs/42'
    );
    expect(mail.text).toContain('排程');
  });

  it('警告：列出缺欄分頁與各分頁件數（SC-004）', () => {
    const mail = notificationOf(warned, {})!;
    expect(mail.subject).toBe('[爭鮮 PMO] 工作表更新有警告（2026-09-15）');
    expect(mail.text).toContain('SAP 分頁尚未有 Progress 與燈號欄');
    expect(mail.text).toContain('Frontend 4');
    expect(mail.text).not.toContain('actions/runs');
  });
});

describe('網站網址（spec 002 FR-013、SC-012）', () => {
  const withSite = { ...env, PMO_SITE_URL: 'https://pmo.example.com/' };

  it('成功與警告信附網站網址（案件追蹤頁）', () => {
    expect(notificationOf(ok, withSite).text).toContain(
      '網站：https://pmo.example.com/tracker'
    );
    expect(notificationOf(warned, withSite).text).toContain(
      '網站：https://pmo.example.com/tracker'
    );
  });

  it('網址結尾沒有斜線時也指向案件追蹤頁', () => {
    const noSlash = { ...env, PMO_SITE_URL: 'https://pmo.example.com' };
    expect(notificationOf(ok, noSlash).text).toContain(
      '網站：https://pmo.example.com/tracker'
    );
  });

  it('失敗信不附網站網址；未設定時也不附', () => {
    expect(notificationOf(failed, withSite).text).not.toContain('網站：');
    expect(notificationOf(ok, env).text).not.toContain('網站：');
  });
});

describe('不含存取密碼（spec 002 FR-005、NFR-002、SC-011）', () => {
  const withPassword = { ...env, PMO_ACCESS_PASSWORD: 'Page-Pass-2026' };

  it.each([
    ['成功', ok],
    ['警告', warned],
    ['失敗', failed],
  ])('%s信不含存取密碼', (_label, report) => {
    const mail = notificationOf(report, withPassword);
    expect(`${mail.subject}${mail.text}`).not.toContain('Page-Pass-2026');
    expect(mail.text).not.toContain('存取密碼');
  });
});

describe('smtpSettingsOf', () => {
  it('465 使用 SSL、587 使用 STARTTLS；收件人可多位', () => {
    expect(smtpSettingsOf(env)).toMatchObject({
      host: 'smtp.example.com',
      port: 465,
      secure: true,
      to: ['owner@example.com', 'pm@example.com'],
    });
    expect(smtpSettingsOf({ ...env, PMO_SMTP_PORT: '587' })).toMatchObject({
      port: 587,
      secure: false,
    });
  });

  it('缺少設定時列出缺少的名稱', () => {
    expect(smtpSettingsOf({ PMO_SMTP_HOST: 'h' })).toEqual({
      missing: [
        'PMO_NOTIFY_EMAIL',
        'PMO_SMTP_PORT',
        'PMO_SMTP_FROM',
        'PMO_SMTP_USER',
        'PMO_SMTP_PASSWORD',
      ],
    });
  });

  it('埠號不是整數時視為缺少', () => {
    expect(smtpSettingsOf({ ...env, PMO_SMTP_PORT: 'abc' })).toEqual({
      missing: ['PMO_SMTP_PORT'],
    });
  });
});

describe('sendNotification', () => {
  it('失敗時寄出，SMTP 連線設定正確', async () => {
    const t = jsonTransport();
    const result = await sendNotification(failed, env, t.create);
    expect(result).toEqual({
      sent: true,
      to: ['owner@example.com', 'pm@example.com'],
    });
    expect(t.options[0]).toEqual({
      host: 'smtp.example.com',
      port: 465,
      secure: true,
      auth: { user: 'bot@example.com', pass: 'S3CRET-PASS' },
    });
  });

  it('成功時也寄出；缺設定時略過並回傳原因', async () => {
    const sent = jsonTransport();
    expect(await sendNotification(ok, env, sent.create)).toEqual({
      sent: true,
      to: ['owner@example.com', 'pm@example.com'],
    });
    const t = jsonTransport();
    expect(await sendNotification(failed, {}, t.create)).toEqual({
      sent: false,
      reason: expect.stringMatching(/^未設定通知：缺少 PMO_NOTIFY_EMAIL/),
    });
    expect(t.create).not.toHaveBeenCalled();
  });

  it('未傳入 transport 且缺設定時，不建立連線直接略過', async () => {
    expect(await sendNotification(ok, {})).toEqual({
      sent: false,
      reason: expect.stringMatching(/^未設定通知/),
    });
  });

  it('郵件內容不含任何 Secret', async () => {
    const mail = notificationOf(failed, env)!;
    expect(`${mail.subject}${mail.text}`).not.toContain('S3CRET-PASS');
  });
});

describe('main（CLI）', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  function withReport(report: unknown) {
    const cwd = mkdtempSync(join(tmpdir(), 'notify-'));
    writeFileSync(join(cwd, 'update-report.json'), JSON.stringify(report));
    return cwd;
  }

  it('寄出或略過時回傳 0 並記錄結果', async () => {
    expect(await main(withReport(failed), env, jsonTransport().create)).toBe(0);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('已寄出通知')
    );
    expect(await main(withReport(failed), {}, jsonTransport().create)).toBe(0);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('未設定通知')
    );
  });

  it('寄送失敗或讀不到報告時回傳 1，錯誤訊息不含密碼', async () => {
    const broken = jest.fn(() => ({
      sendMail: async () => Promise.reject(new Error('auth failed')),
    }));
    expect(await main(withReport(failed), env, broken as never)).toBe(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('auth failed')
    );
    expect(console.error).not.toHaveBeenCalledWith(
      expect.stringContaining('S3CRET-PASS')
    );
    expect(
      await main(mkdtempSync(join(tmpdir(), 'x-')), env, jsonTransport().create)
    ).toBe(1);
  });
});
