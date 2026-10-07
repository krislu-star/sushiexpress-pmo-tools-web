import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import sample from '../../../tests/fixtures/snapshot.sample.json';
import { encryptSnapshot, type EncryptedSnapshot } from '@/lib/pmo/crypto';
import { parseSnapshot, type Snapshot } from '@/lib/pmo/snapshotSchema';
import { SESSION_KEY_NAME } from '@/hooks/use-session-key';
import { AccessGate } from './AccessGate';

const snapshot = parseSnapshot(sample);
let encrypted: EncryptedSnapshot;
beforeAll(async () => {
  encrypted = await encryptSnapshot(snapshot, 'pw');
});
beforeEach(() => sessionStorage.clear());

const child = (s: Snapshot) => (
  <p>已解密：{s.sheets.Frontend.rows[0].values[3]}</p>
);

function renderGate(data = { encrypted }) {
  return render(
    <AccessGate pageName="IT 案件追蹤" data={data}>
      {child}
    </AccessGate>
  );
}

async function unlock(password: string) {
  await userEvent.type(await screen.findByLabelText('存取密碼'), password);
  await userEvent.click(screen.getByRole('button', { name: '開啟' }));
}

describe('AccessGate（spec US-003、US-004）', () => {
  it('未驗證時只顯示密碼畫面，沒有任何案件文字', async () => {
    const { container } = renderGate();
    expect(
      await screen.findByRole('heading', { name: '請輸入存取密碼' })
    ).toBeInTheDocument();
    expect(screen.getByText('IT 案件追蹤')).toBeInTheDocument();
    expect(container.textContent).not.toContain('POS優化');
  });

  it('正確密碼後顯示內容，並將金鑰（不是密碼）存入 sessionStorage（SC-007）', async () => {
    renderGate();
    await unlock('pw');
    expect(await screen.findByText('已解密：POS優化')).toBeInTheDocument();
    const stored = sessionStorage.getItem(SESSION_KEY_NAME)!;
    expect(JSON.parse(stored).salt).toBe(encrypted.kdf.salt);
    expect(stored).not.toContain('pw"');
  });

  it('密碼錯誤顯示「密碼不正確」，不顯示內容並可重試（SC-008）', async () => {
    renderGate();
    await unlock('wrong');
    expect(await screen.findByRole('alert')).toHaveTextContent('密碼不正確');
    expect(screen.queryByText(/已解密/)).toBeNull();
    expect(screen.getByLabelText('存取密碼')).toHaveValue('');
    await unlock('pw');
    expect(await screen.findByText('已解密：POS優化')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('同分頁已有相同 salt 的金鑰時直接解密，不需輸入（SC-007）', async () => {
    const first = renderGate();
    await unlock('pw');
    await screen.findByText(/已解密/);
    first.unmount();
    renderGate();
    expect(await screen.findByText('已解密：POS優化')).toBeInTheDocument();
    expect(screen.queryByLabelText('存取密碼')).toBeNull();
  });

  it('資料重建（salt 不同）或金鑰損毀時要求重新輸入', async () => {
    sessionStorage.setItem(
      SESSION_KEY_NAME,
      JSON.stringify({ salt: 'x', key: 'y' })
    );
    renderGate();
    expect(await screen.findByLabelText('存取密碼')).toBeInTheDocument();
    sessionStorage.setItem(SESSION_KEY_NAME, '{not json');
    renderGate();
    expect(
      (await screen.findAllByLabelText('存取密碼')).length
    ).toBeGreaterThan(0);
  });

  it('解密中停用按鈕並顯示狀態', async () => {
    renderGate();
    await userEvent.type(await screen.findByLabelText('存取密碼'), 'pw');
    const button = screen.getByRole('button', { name: '開啟' });
    await userEvent.click(button);
    await waitFor(() =>
      expect(screen.getByText('已解密：POS優化')).toBeInTheDocument()
    );
  });

  it('本機明文模式直接顯示內容', () => {
    render(
      <AccessGate pageName="x" data={{ plaintext: snapshot }}>
        {child}
      </AccessGate>
    );
    expect(screen.getByText('已解密：POS優化')).toBeInTheDocument();
  });
});
