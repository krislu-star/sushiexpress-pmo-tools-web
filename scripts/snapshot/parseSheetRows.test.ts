/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { toApiValues } from '../../tests/sheetsApi';
import { parseSheetCsv, SnapshotBuildError } from './buildSnapshot';
import { parseSheetRows } from './parseSheetRows';

const csvOf = (g: string) =>
  readFileSync(join(__dirname, '../../tests/fixtures/csv', `${g}.csv`), 'utf8');

describe('parseSheetRows（CSV 與 API 共用）', () => {
  it.each(['Frontend', 'Project', 'BPM', 'SAP'])(
    '%s：API values（省略尾端空白）與 CSV 解析結果相同',
    group => {
      const warnCsv = jest.fn();
      const warnApi = jest.fn();
      expect(parseSheetRows(toApiValues(csvOf(group)), group, warnApi)).toEqual(
        parseSheetCsv(csvOf(group), group, warnCsv)
      );
      expect(warnApi.mock.calls).toEqual(warnCsv.mock.calls);
    }
  );

  it('中間的空白列保留列號', () => {
    const values = toApiValues(csvOf('Frontend'));
    expect(
      parseSheetRows(values, 'Frontend').rows.map(r => r.sourceRow)
    ).toEqual([2, 4, 9, 23]);
  });

  it('未提供警告函式時，缺欄分頁仍可解析', () => {
    expect(parseSheetRows(toApiValues(csvOf('SAP')), 'SAP').rows).toHaveLength(
      4
    );
  });

  it('沒有任何列時指出分頁', () => {
    expect(() => parseSheetRows([], 'BPM')).toThrow(/BPM.*13 或 15/);
  });

  it('Progress 錯誤時訊息含分頁、列號與原值', () => {
    const values = toApiValues(csvOf('Project'));
    values[3] = [...values[3].slice(0, 13), '約九成'];
    expect(() => parseSheetRows(values, 'Project')).toThrow(SnapshotBuildError);
    expect(() => parseSheetRows(values, 'Project')).toThrow(
      /Project 分頁第 4 列 Progress「約九成」/
    );
  });
});
