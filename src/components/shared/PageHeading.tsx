import type { ReactNode } from 'react';

interface PageHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

/** 頁面標題區。 */
export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: PageHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="tracking-[1.5px] text-text-brand word-subtle-semibold">
          {eyebrow}
        </div>
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
          {title}
        </h1>
        <p className="text-text-secondary word-body">{description}</p>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
