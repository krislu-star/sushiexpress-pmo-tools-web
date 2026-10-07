import type { GetStaticProps } from 'next';
import Head from 'next/head';
import { useMemo } from 'react';
import { AccessGate } from '@/components/shared/AccessGate';
import { MeetingView } from '@/components/meeting/MeetingView';
import { toCases } from '@/lib/pmo/cases';
import { meetingEditableOf } from '@/lib/pmo/features';
import { readPageData, type PageData } from '@/lib/pmo/pageData';
import type { Snapshot } from '@/lib/pmo/snapshotSchema';

/** 建置時讀取已加密的頁面資料（plan ADR-003）；明文不進入頁面。 */
export const getStaticProps: GetStaticProps<{
  data: PageData;
  editable: boolean;
}> = async () => ({
  props: {
    data: readPageData(process.cwd()),
    editable: meetingEditableOf(process.env),
  },
});

/** 解密後的頁面內容。 */
function MeetingBody({
  snapshot,
  editable,
}: {
  snapshot: Snapshot;
  editable: boolean;
}) {
  const cases = useMemo(() => toCases(snapshot), [snapshot]);
  return (
    <MeetingView
      cases={cases}
      capturedAt={snapshot.capturedAt}
      editable={editable}
    />
  );
}

/** IT 內部會議 入口頁（meeting.html）。 */
export default function MeetingPage({
  data,
  editable,
}: {
  data: PageData;
  editable: boolean;
}) {
  return (
    <>
      <Head>
        <title>爭鮮｜IT 內部會議</title>
      </Head>
      <AccessGate pageName="IT 內部會議" data={data}>
        {snapshot => <MeetingBody snapshot={snapshot} editable={editable} />}
      </AccessGate>
    </>
  );
}
