import Link from 'next/link';

/** 三頁導覽項目（spec 002 FR-018）；名稱與各頁 pageName 一致。 */
export const PAGES = [
  { name: 'IT 案件追蹤', href: '/tracker' },
  { name: '管理層呈報', href: '/management' },
  { name: 'IT 內部會議', href: '/meeting' },
] as const;

/** 頁首導覽：以頁面名稱判定目前頁並標示 aria-current（plan ADR-009）。 */
export function PageNav({ current }: { current: string }) {
  return (
    <nav
      aria-label="頁面"
      className="order-3 w-full md:order-none md:w-auto md:border-l md:border-achromatic-700 md:pl-6"
    >
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {PAGES.map(page => {
          const active = page.name === current;
          return (
            <li key={page.href}>
              <Link
                href={page.href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex min-h-10 items-center border-b-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${
                  active
                    ? 'border-brand font-semibold text-text-invert'
                    : 'border-transparent text-achromatic-400 hover:text-text-invert'
                }`}
              >
                {page.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
