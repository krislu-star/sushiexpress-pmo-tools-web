import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import '@/components/ui/table.css';

/** 全站共用的 App 外殼：載入全域樣式。 */
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
