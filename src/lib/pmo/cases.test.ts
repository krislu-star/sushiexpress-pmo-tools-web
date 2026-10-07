import sample from '../../../tests/fixtures/snapshot.sample.json';
import { snapshotWith } from '../../../tests/factories';
import {
  latestOf,
  NO_LOG,
  NOT_PROVIDED,
  toCases,
  UNCATEGORIZED,
} from './cases';
import { parseSnapshot } from './snapshotSchema';

describe('toCases', () => {
  it('依小組順序、原表列序展開全部案件，order 為原表順序', () => {
    const cases = toCases(parseSnapshot(sample));
    expect(cases).toHaveLength(16);
    expect(cases.map(c => c.group)).toEqual([
      ...Array(4).fill('Frontend'),
      ...Array(4).fill('Project'),
      ...Array(4).fill('BPM'),
      ...Array(4).fill('SAP'),
    ]);
    expect(cases.map(c => c.order)).toEqual([...Array(16).keys()]);
    expect(cases[0]).toMatchObject({
      id: 'Frontend-row-2',
      title: 'POS優化',
      owner: 'StevenC',
      sourceRow: 2,
    });
  });

  it('專案為「小組｜原表分類」，空白分類為未分類', () => {
    const [a, b] = toCases(
      snapshotWith({ BPM: [{ 2: ' 簽核 ' }, { 2: '  ' }] })
    );
    expect(a.project).toBe('BPM｜簽核');
    expect(b.project).toBe('BPM｜未分類');
  });

  it('空白欄位顯示未提供；BPM 單號與 LOG 保留空字串；名稱去除前後空白', () => {
    const [c] = toCases(snapshotWith({ SAP: [{ 3: '  報表  ' }] }));
    expect(c).toMatchObject({
      title: '報表',
      category: '未提供',
      department: '未提供',
      owner: '未提供',
      status: '未提供',
      due: '未提供',
      bpmId: '',
      log: '',
    });
  });

  it('對應原表欄位', () => {
    const [c] = toCases(
      snapshotWith({
        Project: [
          {
            1: '客製',
            4: 'ITS1',
            6: 'Eric',
            8: 'Timo',
            9: '12/31',
            11: 'Open',
          },
        ],
      })
    );
    expect(c).toMatchObject({
      category: '客製',
      bpmId: 'ITS1',
      department: 'Eric',
      owner: 'Timo',
      due: '12/31',
      status: 'Open',
    });
  });

  it('最新進度取 LOG 前三個非空行，保留原文；無 LOG 顯示原表尚無 LOG', () => {
    const log = '\n9/8 交付\n\n  9/4 討論  \n9/3 回覆\n9/2 回饋';
    const [a, b] = toCases(
      snapshotWith({ BPM: [{ 10: log }, { 10: ' \n ' }] })
    );
    expect(a.latest).toBe('9/8 交付\n9/4 討論\n9/3 回覆');
    expect(a.log).toBe(log);
    expect(b.latest).toBe('原表尚無 LOG');
  });

  it('完成度與燈號取自原表 Progress 與燈號欄；空白為 null／待評估；更新日期仍為 null（FR-008、SC-010）', () => {
    const [a, b] = toCases(
      snapshotWith({ SAP: [{ 13: '90%', 14: '🟡 黃燈' }, {}] })
    );
    expect(a).toMatchObject({
      progress: 90,
      sheetLight: 'yellow',
      updated: null,
    });
    expect(b).toMatchObject({ progress: null, sheetLight: 'gray' });
  });

  it('範例快照：POS優化 完成度 65%、原表綠燈', () => {
    const [pos] = toCases(parseSnapshot(sample));
    expect(pos).toMatchObject({ progress: 65, sheetLight: 'green' });
  });

  it('原始工作表連結指向該分頁的 D:M 範圍', () => {
    const [, c] = toCases(snapshotWith({ BPM: [{}, {}] }));
    expect(c.sourceSheetId).toBe(30);
    expect(c.sourceUrl).toBe(
      'https://docs.google.com/spreadsheets/d/SHEET/edit#gid=30&range=D3:M3'
    );
  });
});

describe('latestOf 與顯示文字', () => {
  it('可單獨使用', () => {
    expect(latestOf('a\n\nb')).toBe('a\nb');
    expect(latestOf('')).toBe(NO_LOG);
    expect([NOT_PROVIDED, UNCATEGORIZED]).toEqual(['未提供', '未分類']);
  });
});
