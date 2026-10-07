import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { DialogCloseButton } from './DialogCloseButton';

describe('DialogCloseButton', () => {
  it('右上角「關閉」按鈕可關閉對話框', async () => {
    const onOpenChange = jest.fn();
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>標題</DialogTitle>
          <DialogCloseButton />
        </DialogContent>
      </Dialog>
    );
    await userEvent.click(screen.getByRole('button', { name: '關閉' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
