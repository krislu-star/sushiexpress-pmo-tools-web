import Head from 'next/head';

const TRACKER = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/tracker`;

/**
 * 網站根頁：轉到案件追蹤頁（spec 002 SC-012）。以 meta refresh 轉址，不使用腳本（CSP）；
 * 瀏覽器未自動轉址時提供連結。
 */
export default function IndexPage() {
  return (
    <>
      <Head>
        <title>爭鮮｜IT 案件追蹤</title>
        <meta httpEquiv="refresh" content={`0; url=${TRACKER}`} />
      </Head>
      <main className="p-10">
        <a href={TRACKER} className="text-text-brand underline">
          前往 IT 案件追蹤
        </a>
      </main>
    </>
  );
}
