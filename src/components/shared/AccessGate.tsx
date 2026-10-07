import { LockKeyhole } from 'lucide-react';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loadSessionKey, saveSessionKey } from '@/hooks/use-session-key';
import {
  decryptWithKey,
  deriveKey,
  exportSessionKey,
  importSessionKey,
  type EncryptedSnapshot,
} from '@/lib/pmo/crypto';
import type { PageData } from '@/lib/pmo/pageData';
import type { Snapshot } from '@/lib/pmo/snapshotSchema';

interface AccessGateProps {
  pageName: string;
  data: PageData;
  children: (snapshot: Snapshot) => ReactNode;
}

/** 以本分頁保存的金鑰嘗試解密；沒有或失效時回傳 null。 */
async function unlockWithStoredKey(
  encrypted: EncryptedSnapshot
): Promise<Snapshot | null> {
  const session = loadSessionKey();
  const key = session && (await importSessionKey(session, encrypted));
  if (!key) return null;
  return decryptWithKey(encrypted, key).catch(() => null);
}

/** 以密碼解密並保存衍生金鑰；密碼錯誤時拋出 DecryptError。 */
async function unlockWithPassword(
  encrypted: EncryptedSnapshot,
  password: string
): Promise<Snapshot> {
  const key = await deriveKey(password, encrypted);
  const snapshot = await decryptWithKey(encrypted, key);
  saveSessionKey(await exportSessionKey(key, encrypted));
  return snapshot;
}

interface GateFormProps {
  busy: boolean;
  error: string;
  onSubmit: (password: string) => void;
}

/** 密碼表單；密碼錯誤後清空輸入。 */
function GateForm({ busy, error, onSubmit }: GateFormProps) {
  const [password, setPassword] = useState('');
  useEffect(() => {
    if (error) setPassword('');
  }, [error]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(password);
  };
  return (
    <form
      onSubmit={submit}
      className="flex w-full max-w-sm flex-col gap-4 rounded-radius-8 border border-border-primary-minor bg-surface-secondary p-6"
    >
      <LockKeyhole aria-hidden className="h-8 w-8 text-icon-brand" />
      <h1 className="text-xl font-bold text-text-primary">請輸入存取密碼</h1>
      <p className="text-text-secondary word-subtle">
        本頁含爭鮮內部工作資料，僅限授權人員檢視。
      </p>
      <label className="flex flex-col gap-1 text-text-primary word-body-medium">
        存取密碼
        <Input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoFocus
        />
      </label>
      {error && (
        <p role="alert" className="text-text-error word-subtle">
          {error}
        </p>
      )}
      <p role="status" className="text-text-secondary word-subtle">
        {busy ? '解密中…' : ''}
      </p>
      <Button type="submit" disabled={busy || !password}>
        開啟
      </Button>
    </form>
  );
}

/** 密碼輸入畫面：品牌頂欄與表單，不含任何案件資料。 */
function GateScreen({
  pageName,
  ...form
}: GateFormProps & { pageName: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-baseline gap-4 border-t-[5px] border-brand bg-[#202124] px-4 py-4 text-text-invert md:px-10">
        <strong className="text-[28px] font-extrabold tracking-[2px] text-brand">
          爭鮮
        </strong>
        <span className="text-sm text-achromatic-400">{pageName}</span>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-16">
        <GateForm {...form} />
      </main>
    </div>
  );
}

/** 密文頁面：先試本分頁金鑰，否則要求輸入密碼。 */
function EncryptedGate({
  pageName,
  encrypted,
  children,
}: {
  pageName: string;
  encrypted: EncryptedSnapshot;
  children: AccessGateProps['children'];
}) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [phase, setPhase] = useState<'checking' | 'locked' | 'unlocking'>(
    'checking'
  );
  const [error, setError] = useState('');
  useEffect(() => {
    unlockWithStoredKey(encrypted).then(result =>
      result ? setSnapshot(result) : setPhase('locked')
    );
  }, [encrypted]);
  const unlock = (password: string) => {
    setPhase('unlocking');
    unlockWithPassword(encrypted, password)
      .then(result => {
        setError('');
        setSnapshot(result);
      })
      .catch(() => {
        setError('密碼不正確');
        setPhase('locked');
      });
  };
  if (snapshot) return <>{children(snapshot)}</>;
  if (phase === 'checking')
    return (
      <div role="status" className="p-10 text-text-secondary">
        載入中…
      </div>
    );
  return (
    <GateScreen
      pageName={pageName}
      busy={phase === 'unlocking'}
      error={error}
      onSubmit={unlock}
    />
  );
}

/**
 * 存取保護（spec US-003、US-004）：資料為密文時要求密碼，解密後才渲染內容；
 * 本機明文模式直接渲染。
 */
export function AccessGate({ pageName, data, children }: AccessGateProps) {
  if ('plaintext' in data) return <>{children(data.plaintext)}</>;
  return (
    <EncryptedGate pageName={pageName} encrypted={data.encrypted}>
      {children}
    </EncryptedGate>
  );
}
