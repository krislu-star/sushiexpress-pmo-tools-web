import { caseWith } from '../../../tests/factories';
import { filterCases, optionsOf } from './filterCases';

const cases = [
  caseWith({
    id: 'a',
    title: 'POS優化',
    group: 'Frontend',
    status: 'Open',
    project: 'Frontend｜統智',
    owner: 'StevenC',
  }),
  caseWith({
    id: 'b',
    title: '供應商平台',
    group: 'Project',
    status: '進行中',
    project: 'Project｜未分類',
    bpmId: 'ITS250430005',
  }),
  caseWith({
    id: 'c',
    title: '憑證',
    group: 'Project',
    status: 'Open',
    category: '維運',
    project: 'Project｜未分類',
    log: '9/1 與 pos 廠商確認',
  }),
];
const ids = (list: typeof cases) => list.map(c => c.id);

describe('filterCases', () => {
  it('沒有條件時回傳全部', () => {
    expect(ids(filterCases(cases, {}))).toEqual(['a', 'b', 'c']);
  });

  it('關鍵字比對名稱、BPM 單號、負責人、類型、完整 LOG，不分大小寫、忽略前後空白', () => {
    expect(ids(filterCases(cases, { query: '  pos ' }))).toEqual(['a', 'c']);
    expect(ids(filterCases(cases, { query: 'its2504' }))).toEqual(['b']);
    expect(ids(filterCases(cases, { query: 'stevenc' }))).toEqual(['a']);
    expect(ids(filterCases(cases, { query: '維運' }))).toEqual(['c']);
  });

  it('依小組、狀態、專案篩選，可與關鍵字組合', () => {
    expect(ids(filterCases(cases, { group: 'Project' }))).toEqual(['b', 'c']);
    expect(ids(filterCases(cases, { status: 'Open' }))).toEqual(['a', 'c']);
    expect(ids(filterCases(cases, { project: 'Frontend｜統智' }))).toEqual([
      'a',
    ]);
    expect(
      ids(filterCases(cases, { group: 'Project', status: 'Open', query: '憑' }))
    ).toEqual(['c']);
  });

  it('不改變輸入陣列', () => {
    const copy = [...cases];
    filterCases(cases, { group: 'SAP' });
    expect(cases).toEqual(copy);
  });
});

describe('optionsOf', () => {
  it('回傳去重後的選項，保留首次出現順序', () => {
    expect(optionsOf(cases, 'status')).toEqual(['Open', '進行中']);
    expect(optionsOf(cases, 'project')).toEqual([
      'Frontend｜統智',
      'Project｜未分類',
    ]);
  });
});
