import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { caseWith } from '../../../tests/factories';
import { CaseTable } from './CaseTable';

const cases = [
  caseWith({
    id: 'a',
    title: 'POS優化',
    bpmId: '',
    sourceRow: 2,
    owner: 'StevenC',
    status: 'Open',
    latest: '9/8 交付',
  }),
  caseWith({ id: 'b', title: '供應商平台', bpmId: 'ITS1', sourceRow: 6 }),
];

describe('CaseTable', () => {
  it('每列顯示案件欄位，無 BPM 單號時顯示來源列', () => {
    render(
      <CaseTable
        cases={cases}
        sortKey="order"
        direction="asc"
        onSort={() => {}}
        onOpen={() => {}}
      />
    );
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('POS優化');
    expect(rows[0]).toHaveTextContent('來源列 2');
    expect(rows[0]).toHaveTextContent('StevenC');
    expect(rows[0]).toHaveTextContent('9/8 交付');
    expect(rows[1]).toHaveTextContent('ITS1');
  });

  it('欄名為排序按鈕，目前欄位標示 aria-sort', async () => {
    const onSort = jest.fn();
    render(
      <CaseTable
        cases={cases}
        sortKey="title"
        direction="desc"
        onSort={onSort}
        onOpen={() => {}}
      />
    );
    expect(
      screen.getByRole('columnheader', { name: /案件名稱/ })
    ).toHaveAttribute('aria-sort', 'descending');
    expect(
      screen.getByRole('columnheader', { name: /負責人/ })
    ).toHaveAttribute('aria-sort', 'none');
    await userEvent.click(screen.getByRole('button', { name: /負責人/ }));
    expect(onSort).toHaveBeenCalledWith('owner');
  });

  it('點案件名稱或進度紀錄開啟詳細內容', async () => {
    const onOpen = jest.fn();
    render(
      <CaseTable
        cases={cases}
        sortKey="order"
        direction="asc"
        onSort={() => {}}
        onOpen={onOpen}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'POS優化' }));
    await userEvent.click(
      screen.getByRole('button', { name: '查看POS優化完整進度紀錄' })
    );
    expect(onOpen).toHaveBeenNthCalledWith(1, cases[0]);
    expect(onOpen).toHaveBeenNthCalledWith(2, cases[0]);
  });

  it('可加入前置欄位（例如呈報選取）', () => {
    render(
      <CaseTable
        cases={cases}
        sortKey="order"
        direction="asc"
        onSort={() => {}}
        onOpen={() => {}}
        leading={{ header: '呈報', cell: c => <span>選取{c.id}</span> }}
      />
    );
    expect(
      screen.getByRole('columnheader', { name: '呈報' })
    ).toBeInTheDocument();
    expect(
      within(screen.getAllByRole('row')[1]).getByText('選取a')
    ).toBeInTheDocument();
  });
});
