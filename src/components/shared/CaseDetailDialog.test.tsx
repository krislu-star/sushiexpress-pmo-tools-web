import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { caseWith } from '../../../tests/factories';
import { CaseDetailDialog } from './CaseDetailDialog';

const target = caseWith({
  title: 'POS優化',
  group: 'Frontend',
  sourceRow: 2,
  status: 'Open',
  owner: 'StevenC',
  project: 'Frontend｜統智',
  category: '客製',
  due: '12/31',
  log: '9/8 交付\n<b>9/4</b> 討論',
  sourceUrl: 'https://docs.google.com/spreadsheets/d/S/edit#gid=1&range=D2:M2',
});

describe('CaseDetailDialog', () => {
  it('顯示案件欄位、完整 LOG 與原表連結（FR-007）', () => {
    render(
      <CaseDetailDialog
        item={target}
        capturedAt="2026-09-15"
        onClose={() => {}}
      />
    );
    const dialog = screen.getByRole('dialog', { name: 'POS優化' });
    expect(dialog).toHaveTextContent(
      'Frontend 原表 · 來源列 2 · 2026/09/15 擷取'
    );
    for (const text of [
      'Open',
      'Frontend｜統智',
      '客製',
      'StevenC',
      '12/31',
      '未提供',
    ]) {
      expect(dialog).toHaveTextContent(text);
    }
    const link = screen.getByRole('link', { name: /查看原始工作表/ });
    expect(link).toHaveAttribute('href', target.sourceUrl);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('LOG 內的 HTML 以純文字呈現（NFR-003）', () => {
    render(
      <CaseDetailDialog
        item={target}
        capturedAt="2026-09-15"
        onClose={() => {}}
      />
    );
    expect(screen.getByText(/<b>9\/4<\/b> 討論/)).toBeInTheDocument();
    expect(document.querySelector('[role="dialog"] b')).toBeNull();
  });

  it('無 LOG 時顯示原表尚無 LOG', () => {
    render(
      <CaseDetailDialog
        item={caseWith({ title: 'X' })}
        capturedAt="2026-09-15"
        onClose={() => {}}
      />
    );
    expect(screen.getByRole('dialog')).toHaveTextContent('原表尚無 LOG');
  });

  it('item 為 null 時不顯示；關閉時呼叫 onClose', async () => {
    const onClose = jest.fn();
    const { rerender } = render(
      <CaseDetailDialog item={null} capturedAt="2026-09-15" onClose={onClose} />
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    rerender(
      <CaseDetailDialog
        item={target}
        capturedAt="2026-09-15"
        onClose={onClose}
      />
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
