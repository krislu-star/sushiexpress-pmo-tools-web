// 複製自 cms/apps/admin/src/components/ui（cms@0a0a5e2c，唯讀來源，plan ADR-003）；變更見檔內「sushi:」註解
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariant = cva(
  [
    'outline-none select-none',
    'inline-flex items-center justify-center gap-2 flex-shrink-0',
    '[&_.lucide]:w-4 [&_.lucide]:h-4 [&_.lucide]:flex-shrink-0',
  ],
  {
    variants: {
      constraint: {
        false: 'min-w-0 max-w-none whitespace-nowrap',
        true: 'min-w-[40px] max-w-[130px] px-3 h-7 truncate',
      },
      variant: {
        success: [
          'word-subtle-semibold',
          'bg-transparent text-text-success border border-border-success rounded-radius-64',
        ],
        destructive: [
          'word-subtle-semibold',
          'text-text-error border border-border-error rounded-radius-64',
        ],
        accent: [
          'word-subtle-semibold',
          'text-text-third border border-border-third rounded-radius-64',
        ],
        muted: [
          'word-subtle-semibold',
          'text-text-default border border-border-primary rounded-radius-64',
        ],
        file: [
          'word-subtle-semibold',
          'text-text-third border border-border-third rounded-radius-64',
          'hover:bg-button-third',
          '[&>span]:truncate',
          '[&>span]:outline-none [&>span]:select-none',
          'justify-between',
          'cursor-pointer',
        ],
        'multiple-select': [
          'word-body',
          'bg-button-primary text-text-invert rounded-radius-64',
          'hover:bg-button-primary-hover [&_.lucide]:hover:cursor-pointer',
          '[&>span]:truncate',
          '[&>span]:outline-none [&>span]:select-none',
          'gap-1',
        ],
      },
      disabled: {
        false: '',
        true: 'pointer-events-none',
      },
    },
    compoundVariants: [
      // constraint
      {
        variant: 'file',
        constraint: true,
        className: 'min-w-[62px] max-w-[208px] h-8 pl-var-14 pr-3',
      },
      {
        variant: 'multiple-select',
        constraint: true,
        className: 'min-w-[53px] max-w-[208px] h-6 pl-3 pr-2',
      },
      // disabled
      {
        variant: 'file',
        disabled: true,
        className:
          'border-border-primary text-text-default [&_.lucide]:hidden !px-3',
      },
      {
        variant: 'multiple-select',
        disabled: true,
        className:
          'bg-button-secondary text-text-default [&_.lucide]:hidden px-3',
      },
    ],
    defaultVariants: {
      constraint: true,
      variant: 'success',
      disabled: false,
    },
  }
);

type BadgeCvaProps = VariantProps<typeof badgeVariant>;

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & BadgeCvaProps
>(({ className, constraint, variant, disabled, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(badgeVariant({ constraint, variant, disabled, className }))}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

export { Badge, type BadgeCvaProps };
