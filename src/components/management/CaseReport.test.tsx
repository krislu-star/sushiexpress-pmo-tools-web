import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import sample from '../../../tests/fixtures/snapshot.sample.json';
import { chooseOption } from '../../../tests/select';
import { toCases } from '@/lib/pmo/cases';
import { parseSnapshot } from '@/lib/pmo/snapshotSchema';
import { ManagementView } from './ManagementView';

const cases = toCases(parseSnapshot(sample));

async function openCaseTab() {
  render(<ManagementView cases={cases} capturedAt="2026-09-15" />);
  await userEvent.click(screen.getByRole('tab', { name: '逐案呈報' }));
}
const rowCount = () => screen.getAllByRole('row').length - 1;
const toggle = (title: string) =>
  userEvent.click(screen.getByRole('switch', { name: `將${title}納入呈報` }));

describe('逐案呈報（FR-021）', () => {
  it('逐案勾選，切換篩選後仍保留選取', async () => {
    await openCaseTab();
    expect(screen.getByText('已選 0 件')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '檢視呈報內容' })).toBeDisabled();
    await toggle('POS優化');
    await chooseOption('篩選小組', 'SAP');
    expect(rowCount()).toBe(4);
    await chooseOption('篩選小組', '全部小組');
    expect(
      screen.getByRole('switch', { name: '將POS優化納入呈報' })
    ).toBeChecked();
    expect(screen.getByText('已選 1 件')).toBeInTheDocument();
  });

  it('只看已選、選取目前結果、清空選案', async () => {
    await openCaseTab();
    await chooseOption('篩選小組', 'BPM');
    await userEvent.click(
      screen.getByRole('button', { name: '選取目前結果（4）' })
    );
    expect(screen.getByText('已選 4 件')).toBeInTheDocument();
    await chooseOption('篩選小組', '全部小組');
    await userEvent.click(screen.getByRole('switch', { name: '只看已選案件' }));
    expect(rowCount()).toBe(4);
    await userEvent.click(screen.getByRole('button', { name: '清空選案' }));
    expect(screen.getByText('已選 0 件')).toBeInTheDocument();
  });

  it('預覽每頁 3 件，可上移、下移、移除，返回選案', async () => {
    await openCaseTab();
    for (const title of ['POS優化', 'MT候位更換', '憑證', '供應商平台'])
      await toggle(title);
    await userEvent.click(screen.getByRole('button', { name: '檢視呈報內容' }));
    expect(
      screen.getByRole('heading', { level: 1, name: '資訊案件進度報告' })
    ).toBeInTheDocument();
    const pages = screen.getAllByRole('region', { name: /第 \d+ 頁/ });
    expect(pages).toHaveLength(2);
    expect(within(pages[0]).getAllByRole('heading', { level: 3 })).toHaveLength(
      3
    );
    expect(pages[0]).toHaveTextContent('呈報對象：副董');
    expect(pages[0]).toHaveTextContent('Frontend · 來源列 2 · StevenC');
    const order = () =>
      within(screen.getByRole('list', { name: '呈報順序' }))
        .getAllByRole('listitem')
        .map(li => li.textContent);
    expect(screen.getByRole('button', { name: '上移POS優化' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: '下移POS優化' }));
    expect(order()[1]).toContain('POS優化');
    await userEvent.click(screen.getByRole('button', { name: '移除憑證' }));
    expect(order()).toHaveLength(3);
    expect(screen.getAllByRole('region', { name: /第 \d+ 頁/ })).toHaveLength(
      1
    );
    await userEvent.click(screen.getByRole('button', { name: '返回選案' }));
    expect(screen.getByText('已選 3 件')).toBeInTheDocument();
  });

  it('預覽中可列印', async () => {
    const print = jest.spyOn(window, 'print').mockImplementation(() => {});
    await openCaseTab();
    await toggle('POS優化');
    await userEvent.click(screen.getByRole('button', { name: '檢視呈報內容' }));
    await userEvent.click(
      screen.getByRole('button', { name: '列印／另存 PDF' })
    );
    expect(print).toHaveBeenCalled();
    print.mockRestore();
  });
});
