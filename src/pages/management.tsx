import type { GetStaticProps } from 'next';
import Head from 'next/head';
import { useMemo } from 'react';
import { AccessGate } from '@/components/shared/AccessGate';
import { ManagementView } from '@/components/management/ManagementView';
import { toCases } from '@/lib/pmo/cases';
import { readPageData, type PageData } from '@/lib/pmo/pageData';
import type { Snapshot } from '@/lib/pmo/snapshotSchema';

/** 建置時讀取已加密的頁面資料（plan ADR-003）；明文不進入頁面。 */
export const getStaticProps: GetStaticProps<{ data: PageData }> = async () => ({
  props: { data: readPageData(process.cwd()) },
});

/** 解密後的頁面內容。 */
function ManagementBody({ snapshot }: { snapshot: Snapshot }) {
  const cases = useMemo(() => toCases(snapshot), [snapshot]);
  return <ManagementView cases={cases} capturedAt={snapshot.capturedAt} />;
}

/** 管理層呈報 入口頁（management.html）。 */
export default function ManagementPage({ data }: { data: PageData }) {
  return (
    <>
      <Head>
        <title>爭鮮｜管理層呈報</title>
      </Head>
      <AccessGate pageName="管理層呈報" data={data}>
        {snapshot => <ManagementBody snapshot={snapshot} />}
      </AccessGate>
    </>
  );
}
