import { renderHook } from '@testing-library/react';
import { useRestoreFocus } from './use-restore-focus';

describe('useRestoreFocus', () => {
  it('開啟時記住目前焦點，關閉時還原並阻止預設行為', () => {
    const button = document.createElement('button');
    document.body.append(button);
    button.focus();
    const { result, rerender } = renderHook(
      ({ open }) => useRestoreFocus(open),
      {
        initialProps: { open: false },
      }
    );
    rerender({ open: true });
    const other = document.createElement('input');
    document.body.append(other);
    other.focus();
    const event = { preventDefault: jest.fn() } as unknown as Event;
    result.current(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(button).toHaveFocus();
  });

  it('沒有記錄時不做事', () => {
    const { result } = renderHook(() => useRestoreFocus(false));
    const event = { preventDefault: jest.fn() } as unknown as Event;
    result.current(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
