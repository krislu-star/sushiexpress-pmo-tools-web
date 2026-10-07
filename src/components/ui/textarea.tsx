// 複製自 cms/apps/admin/src/components/ui（cms@0a0a5e2c，唯讀來源，plan ADR-003）；變更見檔內「sushi:」註解
import * as React from 'react';

import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';

const textareaCvaProps = cva(
  [
    'bg-surface-seconddary text-text-primary rounded-radius-6 border border-border-primary outline-none',
    'placeholder:text-text-default',
    'disabled:text-text-secondary',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-third',
  ],
  {
    variants: {
      variant: {
        'fit-container': [
          'resize-none',
          'word-body inline-flex min-h-10 h-full w-full px-3 py-2',
        ],
      },
      invalid: {
        false: '',
        true: 'ring-2 ring-offset-2 ring-border-error focus-visible:ring-border-error',
      },
    },
    defaultVariants: {
      variant: 'fit-container',
      invalid: false,
    },
  }
);

type TextareaCvaProps = VariantProps<typeof textareaCvaProps>;

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  TextareaCvaProps;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(textareaCvaProps({ variant, invalid, className }))}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
