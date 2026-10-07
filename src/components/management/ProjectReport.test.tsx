import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { caseWith } from '../../../tests/factories';
import { groupProjects, type Project } from '@/lib/pmo/projects';
import { ProjectReport } from './ProjectReport';

const projects = groupProjects(
  ['A', 'B', 'C', 'D', 'E'].map((name, order) =>
    caseWith({
      id: name,
      order,
      project: `專案${name}`,
      title: `案件${name}`,
      latest: `${name} 進度`,
    })
  )
);
const order = () =>
  screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent);

function Harness({ initial = projects }: { initial?: Project[] }) {
  const [items, setItems] = useState(initial);
  return (
    <ProjectReport
      projects={items}
      capturedAt="2026-09-15"
      onOrder={names =>
        setItems(names.map(n => items.find(p => p.name === n)!))
      }
    />
  );
}

describe('ProjectReport', () => {
  it('每頁最多 2 個專案，含標題、呈報對象與頁碼（FR-011、FR-024）', () => {
    render(<Harness />);
    const pages = screen.getAllByRole('region', { name: /第 \d+ 頁/ });
    expect(pages).toHaveLength(3);
    expect(within(pages[0]).getAllByRole('heading', { level: 3 })).toHaveLength(
      2
    );
    expect(pages[0]).toHaveTextContent('資訊專案進度報告');
    expect(pages[0]).toHaveTextContent('呈報對象：副董');
    expect(pages[0]).toHaveTextContent('2026/09/15');
    expect(pages[2]).toHaveTextContent('3 / 3');
    expect(pages[0]).toHaveTextContent('案件A：A 進度');
  });

  it('鍵盤上／下／Home／End 移動並朗讀新位置（FR-012、SC-004）', async () => {
    render(<Harness />);
    screen.getByRole('button', { name: '移動專案A' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(order()).toEqual(['專案B', '專案A', '專案C', '專案D', '專案E']);
    expect(screen.getByRole('status')).toHaveTextContent(
      '專案A已移至第 2 位，共 5 個專案。'
    );
    await userEvent.keyboard('{End}');
    expect(order()[4]).toBe('專案A');
    await userEvent.keyboard('{Home}');
    expect(order()[0]).toBe('專案A');
    await userEvent.keyboard('{ArrowUp}');
    expect(order()[0]).toBe('專案A');
  });

  it('其他按鍵不影響順序', async () => {
    render(<Harness />);
    screen.getByRole('button', { name: '移動專案A' }).focus();
    await userEvent.keyboard('x');
    expect(order()[0]).toBe('專案A');
  });

  it('指標拖曳移動；Esc 取消拖曳', () => {
    render(<Harness />);
    const handle = screen.getByRole('button', { name: '移動專案A' });
    fireEvent.pointerDown(handle, {
      isPrimary: true,
      button: 0,
      clientX: 0,
      clientY: 0,
    });
    fireEvent.pointerMove(window, { clientX: 0, clientY: 900 });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(order()[0]).toBe('專案A');
    expect(screen.getByRole('status')).toHaveTextContent('已取消移動。');

    fireEvent.pointerDown(handle, {
      isPrimary: true,
      button: 0,
      clientX: 0,
      clientY: 0,
    });
    fireEvent.pointerMove(window, { clientX: 0, clientY: 900 });
    fireEvent.pointerUp(window);
    expect(order()[4]).toBe('專案A');
  });

  it('沒有 onOrder 時（列印版）不顯示拖曳把手', () => {
    render(<ProjectReport projects={projects} capturedAt="2026-09-15" />);
    expect(screen.queryByRole('button', { name: /移動/ })).toBeNull();
  });

  it('沒有專案時仍顯示一頁空報告', () => {
    render(<ProjectReport projects={[]} capturedAt="2026-09-15" />);
    expect(screen.getAllByRole('region', { name: /第 \d+ 頁/ })).toHaveLength(
      1
    );
    expect(screen.getByText('尚未選取呈報專案。')).toBeInTheDocument();
  });
});
