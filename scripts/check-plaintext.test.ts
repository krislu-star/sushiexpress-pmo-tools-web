/**
 * @jest-environment node
 */
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sample from '../tests/fixtures/snapshot.sample.json';
import { parseSnapshot } from '@/lib/pmo/snapshotSchema';
import { findPlaintext, main, needlesOf } from './check-plaintext';

const snapshot = parseSnapshot(sample);

describe('needlesOf', () => {
  it('取案件名稱、含中文的負責人與 LOG 片段，略過過短或常見字串', () => {
    const needles = needlesOf(snapshot);
    expect(needles).toContain('POS優化');
    expect(needles).toContain('昌宏');
    expect(needles.some(n => n.startsWith('★內部確認需求'))).toBe(true);
    expect(needles).not.toContain('Tim');
    expect(needles).not.toContain('Eric');
    expect(needles.every(n => n.length >= 2)).toBe(true);
  });
});

describe('findPlaintext（spec SC-006）', () => {
  it('找到任一明文即回報', () => {
    expect(findPlaintext('<p>POS優化</p>', ['POS優化', '昌宏'])).toEqual([
      'POS優化',
    ]);
  });

  it('JSON 跳脫後的中文也能找到', () => {
    const escaped = JSON.stringify({ t: '昌宏' }).replace(
      /[\u0080-￿]/g,
      c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`
    );
    expect(findPlaintext(escaped, ['昌宏'])).toEqual(['昌宏']);
  });

  it('只有密文時通過', () => {
    expect(
      findPlaintext('{"data":"q83vEjRW..."}', needlesOf(snapshot))
    ).toEqual([]);
  });
});

describe('main（CLI）', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  function out(files: Record<string, string>) {
    const dir = mkdtempSync(join(tmpdir(), 'out-'));
    for (const [name, content] of Object.entries(files)) {
      mkdirSync(join(dir, name, '..'), { recursive: true });
      writeFileSync(join(dir, name), content);
    }
    return dir;
  }

  it('遞迴掃描 html／js／json／txt，有明文時回傳 1 並列出檔案', () => {
    const dir = out({
      'tracker.html': '<p>ok</p>',
      '_next/static/chunks/a.js': 'x="POS優化"',
      'img.png': 'POS優化',
    });
    expect(main(dir, snapshot)).toBe(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('_next/static/chunks/a.js')
    );
    expect(console.error).not.toHaveBeenCalledWith(
      expect.stringContaining('img.png')
    );
  });

  it('全部為密文時回傳 0', () => {
    expect(main(out({ 'tracker.html': '<p>enc</p>' }), snapshot)).toBe(0);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('未發現明文')
    );
  });
});
