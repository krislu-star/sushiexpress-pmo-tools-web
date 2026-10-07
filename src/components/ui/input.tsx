// 複製自 cms/apps/admin/src/components/ui（cms@0a0a5e2c，唯讀來源，plan ADR-003）；變更見檔內「sushi:」註解
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  [
    'bg-surface-secondary text-text-primary rounded-radius-6 border border-border-primary outline-none',
    'placeholder:text-text-default',
    'disabled:text-text-secondary',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-third',
    '[&[type=number]]:no-arrows',
    'inline-flex',
    'word-body',
  ],
  {
    variants: {
      constraint: {
        false: 'min-w-0 max-w-none whitespace-nowrap',
        true: 'min-w-[204px] w-full h-10 px-3 py-2',
      },
      variant: {
        fixed: '',
        number: [
          'word-body',
          'bg-surface-secondary border border-border-primary rounded-radius-6',
          'aria-disabled:text-text-secondary aria-disabled:pointer-events-none',
          'aria-readonly:border-none aria-readonly:bg-transparent aria-readonly:pointer-events-none',
          'placeholder:text-text-default',
          'no-arrows',
        ],
      },
      invalid: {
        false: '',
        true: 'ring-2 ring-offset-2 ring-border-error focus-visible:ring-border-error',
      },
    },
    compoundVariants: [
      // number
      {
        constraint: true,
        variant: 'number',
        className: 'min-w-10 max-w-[800px] h-10 px-3 field-sizing-content',
      },
    ],
    defaultVariants: {
      constraint: true,
      variant: 'fixed',
      invalid: false,
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  asChild?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      asChild,
      constraint,
      variant,
      disabled,
      readOnly,
      invalid,
      className,
      type,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'input';

    return (
      <Comp
        ref={ref}
        type={type}
        className={cn(
          inputVariants({
            constraint,
            variant,
            invalid,
            className,
          })
        )}
        readOnly={readOnly}
        disabled={disabled}
        aria-readonly={readOnly}
        aria-disabled={disabled}
        tabIndex={disabled || readOnly ? -1 : undefined}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
