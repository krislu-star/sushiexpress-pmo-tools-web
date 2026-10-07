import { caseWith } from '../../../tests/factories';
import { groupProjects, PROJECT_PHASES } from './projects';

describe('groupProjects', () => {
  const cases = [
    caseWith({
      id: 'a',
      order: 0,
      project: 'BPM｜簽核',
      title: '預算單',
      latest: '9/1 上線',
      owner: '昌宏',
    }),
    caseWith({
      id: 'b',
      order: 1,
      project: 'SAP｜未分類',
      title: '報表',
      latest: '原表尚無 LOG',
      owner: '未提供',
    }),
    caseWith({
      id: 'c',
      order: 2,
      project: 'BPM｜簽核',
      title: '用印單',
      latest: '9/2 測試\n9/1 開發',
      owner: 'Herbert',
    }),
    caseWith({
      id: 'd',
      order: 3,
      project: 'BPM｜簽核',
      title: '服務單',
      latest: 'x',
      owner: '昌宏',
    }),
  ];

  it('依專案名稱分組，保留首次出現順序', () => {
    const projects = groupProjects(cases);
    expect(projects.map(p => p.name)).toEqual(['BPM｜簽核', 'SAP｜未分類']);
    expect(projects[0].cases.map(c => c.id)).toEqual(['a', 'c', 'd']);
  });

  it('彙整狀態本版固定為待確認', () => {
    expect(groupProjects(cases).every(p => p.phase === '待確認')).toBe(true);
    expect(PROJECT_PHASES).toEqual([
      '未決議',
      '執行中',
      '完成／成效',
      '待確認',
    ]);
  });

  it('進度紀錄彙整為「案件名稱：最新進度」逐行串接', () => {
    expect(groupProjects(cases)[0].summary).toBe(
      '預算單：9/1 上線\n用印單：9/2 測試\n9/1 開發\n服務單：x'
    );
  });

  it('聯繫人為去重後的負責人，以「、」連接，排除未提供', () => {
    const [bpm, sap] = groupProjects(cases);
    expect(bpm.owners).toBe('昌宏、Herbert');
    expect(sap.owners).toBe('');
  });

  it('沒有案件時回傳空陣列', () => {
    expect(groupProjects([])).toEqual([]);
  });
});
