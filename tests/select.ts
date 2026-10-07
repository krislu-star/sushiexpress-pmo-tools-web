import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/** 在 Radix Select（role=combobox）中選取選項。 */
export async function chooseOption(label: string, option: string) {
  await userEvent.click(screen.getByRole('combobox', { name: label }));
  await userEvent.click(await screen.findByRole('option', { name: option }));
}
