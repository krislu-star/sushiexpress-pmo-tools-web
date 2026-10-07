import { render, screen } from '@testing-library/react';
import { DataBanner } from './DataBanner';

describe('DataBanner', () => {
  it('顯示擷取日期、案件總數與示意說明（FR-017）', () => {
    render(<DataBanner capturedAt="2026-09-15" total={128} />);
    const note = screen.getByRole('note');
    expect(note).toHaveTextContent('2026/09/15');
    expect(note).toHaveTextContent('128 件');
    expect(note).toHaveTextContent('完成度與燈號取自原表 Progress 與燈號欄');
    expect(note).toHaveTextContent('空白者顯示「未提供」與「待評估」');
    expect(note).toHaveTextContent('更新日期原表未提供');
  });

  it('可附加頁面專屬說明', () => {
    render(
      <DataBanner capturedAt="2026-09-15" total={1}>
        燈號只存本機
      </DataBanner>
    );
    expect(screen.getByRole('note')).toHaveTextContent('燈號只存本機');
  });
});
