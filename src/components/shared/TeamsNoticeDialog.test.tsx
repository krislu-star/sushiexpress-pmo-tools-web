import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { TeamsNoticeDialog } from './TeamsNoticeDialog';

function Harness() {
  const [target, setTarget] = useState<{
    owner: string;
    subject: string;
  } | null>(null);
  return (
    <>
      <button
        onClick={() => setTarget({ owner: 'Eric', subject: '供應商平台' })}
      >
        Teams 聯繫
      </button>
      <TeamsNoticeDialog target={target} onClose={() => setTarget(null)} />
    </>
  );
}

describe('TeamsNoticeDialog', () => {
  it('說明尚未設定帳號且未開啟或傳送任何訊息（SC-006、FR-013）', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Teams 聯繫' }));
    const dialog = screen.getByRole('dialog', { name: '與負責人聯繫' });
    expect(dialog).toHaveTextContent('Eric');
    expect(dialog).toHaveTextContent('供應商平台');
    expect(dialog).toHaveTextContent('尚未設定 Teams 帳號');
    expect(dialog).toHaveTextContent('未開啟或傳送任何訊息');
  });

  it('關閉後回到原畫面，焦點回到觸發按鈕', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Teams 聯繫' });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('button', { name: '了解，返回' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });
});
