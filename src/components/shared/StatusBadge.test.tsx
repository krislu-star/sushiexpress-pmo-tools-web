import { render, screen } from '@testing-library/react';
import { ProgressMeter } from './ProgressMeter';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('以文字顯示原表狀態（FR-008）', () => {
    render(<StatusBadge value="進行中" />);
    expect(screen.getByText('進行中')).toHaveAttribute('data-status', '進行中');
  });
});

describe('ProgressMeter', () => {
  it('有數值時顯示百分比與進度條', () => {
    render(<ProgressMeter value={40} label="POS優化" />);
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'POS優化完成進度' })
    ).toHaveAttribute('aria-valuenow', '40');
  });

  it('compact 時不重複顯示「完成進度」', () => {
    render(<ProgressMeter value={null} label="X" compact />);
    expect(screen.queryByText('完成進度')).toBeNull();
    expect(screen.getByText('未提供')).toBeInTheDocument();
  });

  it('null 時顯示未提供且不顯示進度條', () => {
    render(<ProgressMeter value={null} label="POS優化" />);
    expect(screen.getByText('未提供')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});
