import type { GetStaticProps } from 'next';
import Head from 'next/head';
import { useMemo } from 'react';
import { AccessGate } from '@/components/shared/AccessGate';
import { TrackerView } from '@/components/tracker/TrackerView';
import { toCases } from '@/lib/pmo/cases';
import { readPageData, type PageData } from '@/lib/pmo/pageData';
import type { Snapshot } from '@/lib/pmo/snapshotSchema';

/** 建置時讀取已加密的頁面資料（plan ADR-003）；明文不進入頁面。 */
export const getStaticProps: GetStaticProps<{ data: PageData }> = async () => ({
  props: { data: readPageData(process.cwd()) },
});

/** 解密後的頁面內容。 */
function TrackerBody({ snapshot }: { snapshot: Snapshot }) {
  const cases = useMemo(() => toCases(snapshot), [snapshot]);
  return <TrackerView cases={cases} capturedAt={snapshot.capturedAt} />;
}

/** IT 案件追蹤 入口頁（tracker.html）。 */
export default function TrackerPage({ data }: { data: PageData }) {
  return (
    <>
      <Head>
        <title>爭鮮｜IT 案件追蹤</title>
      </Head>
      <AccessGate pageName="IT 案件追蹤" data={data}>
        {snapshot => <TrackerBody snapshot={snapshot} />}
      </AccessGate>
    </>
  );
}
