import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// AccessGate 測試會實際執行 PBKDF2 600,000 次，負載高時可能超過預設 1 秒的非同步等待
configure({ asyncUtilTimeout: 5000 });

// jsdom 缺少 Radix Select 需要的指標與捲動 API
if (typeof window !== 'undefined') {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
}

// jsdom 沒有 PointerEvent；以 MouseEvent 補上拖曳需要的欄位
if (typeof window !== 'undefined' && !window.PointerEvent) {
  class PointerEventPolyfill extends MouseEvent {
    isPrimary: boolean;
    pointerId: number;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.isPrimary = init.isPrimary ?? false;
      this.pointerId = init.pointerId ?? 1;
    }
  }
  window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
}

// jsdom 沒有 TextEncoder／TextDecoder 與 crypto.subtle；以 Node 內建補上（AccessGate 解密用）
if (
  typeof window !== 'undefined' &&
  typeof globalThis.TextEncoder === 'undefined'
) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextDecoder, TextEncoder } = require('node:util');
  Object.assign(globalThis, { TextDecoder, TextEncoder });
}
if (typeof window !== 'undefined' && !globalThis.crypto?.subtle) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { webcrypto } = require('node:crypto');
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
  });
}
