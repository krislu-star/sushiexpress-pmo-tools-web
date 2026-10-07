// 複製自 cms/apps/admin/src/lib/utils/cn.ts（cms@0a0a5e2c）
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 合併 className，後者覆寫前者衝突的 Tailwind class。 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
