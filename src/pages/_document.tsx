import { Head, Html, Main, NextScript } from 'next/document';

/** HTML 文件骨架：固定繁體中文語系。 */
export default function Document() {
  return (
    <Html lang="zh-Hant">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
