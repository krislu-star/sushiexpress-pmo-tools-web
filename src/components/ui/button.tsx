'use client';
// 複製自 cms/apps/admin/src/components/ui（cms@0a0a5e2c，唯讀來源，plan ADR-003）；變更見檔內「sushi:」註解

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  [
    'outline-none',
    'inline-flex items-center gap-1 justify-center',
    'transition-colors select-none',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-third',
    'aria-disabled:pointer-events-none',
    '[&_.lucide]:w-4 [&_.lucide]:h-4',
  ],
  {
    variants: {
      // layout
      constraint: {
        false: 'min-w-0 max-w-none whitespace-nowrap',
        true: 'min-w-[62px] max-w-[136px] truncate',
      },
      // style
      variant: {
        primary: [
          'word-body-medium',
          'bg-button-primary text-text-invert',
          'hover:bg-button-primary-hover',
          'h-10 px-4 py-2 rounded-radius-4',
          'aria-disabled:bg-button-disable',
        ],
        secondary: [
          'word-body-medium',
          'bg-button-invert border border-border-brand text-text-brand',
          'hover:bg-button-invert-hover',
          'h-10 px-4 py-2 rounded-radius-4',
          'aria-disabled:bg-button-secondary-disable aria-disabled:border-border-primary-minor aria-disabled:text-text-default',
        ],
        third: [
          'word-body-medium',
          'bg-button-third border border-border-brand text-text-brand',
          'h-10 px-4 py-2 rounded-radius-4',
          'aria-disabled:bg-button-secondary-disable aria-disabled:border-border-primary aria-disabled:text-text-default',
        ],
        subtle: [
          'word-body-medium',
          'bg-button-secondary text-text-secondary',
          'hover:bg-button-secondary-hover',
          'h-10 px-4 py-2 rounded-radius-4',
          'aria-disabled:bg-button-disable aria-disabled:text-text-default',
        ],
        destructive: [
          'word-body-medium',
          'bg-button-error text-text-invert',
          'hover:bg-button-error-hover',
          'h-10 px-4 py-2 rounded-radius-4',
          'aria-disabled:bg-button-disable',
        ],
        'destructive-secondary': [
          'word-body-medium',
          'bg-button-error-invert border border-border-error text-text-error',
          'hover:bg-button-error-invert-hover',
          'h-10 px-4 py-2 rounded-radius-4',
          'aria-disabled:bg-button-secondary-disable aria-disabled:border-border-primary-minor aria-disabled:text-text-default',
        ],
        'icon-square': [
          'word-body-medium',
          'bg-button-invert border border-border-primary text-button-icon-default',
          'hover:bg-button-third hover:border-border-secondary-minor hover:text-button-primary-hover',
          'w-8 aspect-square rounded-radius-4',
          'aria-disabled:bg-button-secondary-disable aria-disabled:border-border-primary-minor aria-disabled:text-icon-secondary',
        ],
        'icon-circle': [
          'word-body-medium',
          'bg-button-invert border border-border-primary text-button-icon-default',
          'hover:bg-button-third hover:border-secondary-minor hover:text-button-primary-hover',
          'w-9 aspect-square rounded-full',
          'aria-disabled:bg-button-secondary-disable aria-disabled:border-border-primary-minor aria-disabled:text-icon-secondary',
        ],
        'icon-just': [
          'word-body-medium',
          'bg-transparent text-button-icon-default rounded-radius-4',
          'hover:text-button-primary-hover',
          'w-8 aspect-square',
          'aria-disabled:text-icon-secondary',
        ],
        link: [
          'word-body-medium',
          'bg-transparent text-text-secondary underline underline-offset-2 rounded-radius-4',
          'hover:text-text-third',
          'aria-disabled:text-text-default',
          'h-10 py-2 px-4',
        ],
        page: [
          'word-body-medium',
          'text-text-secondary rounded-radius-4',
          'h-8 px-var-6',
          'hover:text-text-third hover:bg-button-third hover:border-border-secondary-minor',
        ],
        select: [
          'word-body',
          'bg-button-invert text-text-default rounded-radius-6 border border-border-primary',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-third',
          'focus:ring-2 focus:ring-offset-2 focus:ring-border-third',
          'aria-disabled:bg-button-secondary-disable aria-disabled:text-text-default',
          'min-h-10 h-max pl-3 pr-9 py-2',
          'justify-start',
          'relative',
        ],
        'date-picker': [
          'word-body',
          'bg-button-invert text-text-default rounded-radius-6 border border-border-primary',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-third',
          'focus:ring-2 focus:ring-offset-2 focus:ring-border-third',
          'aria-disabled:bg-button-secondary-disable aria-disabled:text-text-default',
          'h-10 pl-3 pr-9 py-2',
          'justify-start',
          'relative',
        ],
        tab: [
          'word-table-head',
          'bg-tab-secondary text-text-primary',
          'aria-disabled:bg-button-disabled aria-disabled:text-text-default',
          'focus-visible:z-20',
          'px-5',
        ],
        segment: [
          'word-body-medium',
          'bg-tab-primary text-text-brand border border-border-brand rounded-radius-4',
          'aria-disabled:bg-button-secondary-disable aria-disabled:border-border-primary-minor aria-disabled:text-text-default',
          'px-4',
        ],
        'filter-chip': [
          'word-body',
          'bg-button-invert text-text-brand border border-border-brand rounded-radius-64',
          'hover:bg-button-third',
          'aria-disabled:bg-button-secondary-disable aria-disabled:border-border-primary-minor aria-disabled:text-text-default',
          'px-4',
        ],
      },
      active: {
        false: '',
        true: '',
      },
      invalid: {
        false: '',
        true: 'ring-2 ring-offset-2 ring-border-error focus-visible:ring-border-error focus:ring-border-error',
      },
      disabled: {
        false: '',
        true: 'pointer-events-none',
      },
      loading: {
        false: '',
        true: '[&_.lucide]:animate-spin justify-center',
      },
      notice: {
        false: '',
        true: 'shadow-button-notice',
      },
      hidden: {
        false: '',
        true: 'hidden',
      },
    },
    compoundVariants: [
      // constraint
      {
        variant: ['icon-just', 'icon-square'],
        constraint: true,
        className: 'min-w-8 max-w-8',
      },
      {
        variant: 'icon-circle',
        constraint: true,
        className: 'min-w-9 max-w-9',
      },
      {
        variant: 'page',
        constraint: true,
        className: 'min-w-8 max-w-none',
      },
      {
        variant: 'select',
        constraint: true,
        // TODO: Detail Page / List Page / Fit
        className: ['min-w-[204px] max-w-none', 'flex-wrap'],
      },
      {
        variant: 'date-picker',
        constraint: true,
        className: 'min-w-[204px] max-w-none',
      },
      {
        variant: 'tab',
        constraint: true,
        className: 'min-w-[72px] max-w-none h-[52px]',
      },
      {
        variant: 'segment',
        constraint: true,
        className: 'min-w-[62px] max-w-none h-10',
      },
      {
        variant: 'filter-chip',
        constraint: true,
        className: 'min-w-[62px] max-w-none h-8',
      },
      // invalid
      {
        variant: 'tab',
        invalid: true,
        className: [
          'bg-button-error text-text-invert z-10',
          'ring-transparent',
        ],
      },
      // loading
      {
        variant: 'primary',
        loading: true,
        className: [
          'text-icon-invert bg-button-primary-hover',
          'aria-disabled:bg-button-primary-hover',
        ],
      },
      {
        variant: 'secondary',
        loading: true,
        className: [
          'bg-button-invert-hover border-border-brand text-icon-brand',
          'aria-disabled:bg-button-invert-hover aria-disabled:border-border-brand aria-disabled:text-icon-brand',
        ],
      },
      {
        variant: 'third',
        loading: true,
        className: [
          'bg-button-third border-border-brand',
          'aria-disabled:bg-button-third aria-disabled:border-border-brand aria-disabled:text-text-brand',
        ],
      },
      {
        variant: 'subtle',
        loading: true,
        className: [
          'bg-button-secondary-hover',
          'aria-disabled:bg-button-secondary-hover aria-disabled:text-icon-brand',
        ],
      },
      {
        variant: 'destructive',
        loading: true,
        className: [
          'bg-button-error-hover',
          'aria-disabled:bg-button-error-hover',
        ],
      },
      {
        variant: 'destructive-secondary',
        loading: true,
        className: [
          'bg-button-error-invert-hover border-border-error',
          'aria-disabled:bg-button-error-invert-hover aria-disabled:border-border-error aria-disabled:text-text-error',
        ],
      },
      {
        variant: 'icon-square',
        loading: true,
        className: [
          'bg-button-third border-border-seconddary-minor',
          'aria-disabled:bg-button-third aria-disabled:border-border-secondary-minor aria-disabled:text-icon-brand',
        ],
      },
      {
        variant: 'icon-circle',
        loading: true,
        className: [
          'bg-button-third border-border-secondary-minor',
          'aria-disabled:bg-button-third aria-disabled:border-border-secondary-minor aria-disabled:text-icon-brand',
        ],
      },
      {
        variant: 'icon-just',
        loading: true,
        className: 'aria-disabled:text-button-primary-hover',
      },
      {
        variant: 'page',
        active: true,
        className: 'bg-button-third border-border-secondary-minor',
      },
      // notice
      {
        variant: ['destructive', 'destructive-secondary'],
        notice: true,
        className: 'shadow-none',
      },
      {
        variant: 'icon-just',
        notice: true,
        className: 'bg-button-invert',
      },
      // active
      {
        variant: 'select',
        active: true,
        className: 'text-text-primary',
      },
      {
        variant: 'date-picker',
        active: true,
        className: 'text-text-primary',
      },
      {
        variant: 'tab',
        active: true,
        invalid: false,
        className: 'bg-surface-secondary',
      },
      {
        variant: 'segment',
        active: true,
        className: 'bg-tab-state-active',
      },
      {
        variant: 'filter-chip',
        active: true,
        className:
          'bg-button-primary-hover border-border-third text-text-invert hover:bg-button-primary-hover',
      },
    ],
    defaultVariants: {
      constraint: true,
      variant: 'primary',
      active: false,
      invalid: false,
      disabled: false,
      loading: false,
      notice: false,
      hidden: false,
    },
  }
);

/**
 * Becareful, 'disabled' have to keep the same type with <button> element.
 * Becareful, 'hidden' have to keep the same type with <button> element.
 */
type ButtonCvaProps = Omit<
  VariantProps<typeof buttonVariants>,
  'disabled' | 'hidden'
>;

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonCvaProps {
  asChild?: boolean;
}

interface ButtonComponent
  extends React.ForwardRefExoticComponent<
    ButtonProps & React.RefAttributes<HTMLButtonElement>
  > {
  variant: typeof buttonVariants;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = 'button',
      invalid,
      className,
      constraint,
      variant,
      active,
      loading,
      notice,
      disabled,
      hidden,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        type={type}
        className={cn(
          buttonVariants({
            constraint,
            variant,
            active,
            invalid,
            disabled,
            loading,
            notice,
            hidden,
            className,
          })
        )}
        disabled={disabled}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        {...props}
      >
        {loading ? <Loader variant={variant} /> : children}
      </Comp>
    );
  }
) as ButtonComponent;
Button.displayName = 'Button';

Button.variant = buttonVariants;

//+-----------------------------------------------------------------+
//| Helper
//+-----------------------------------------------------------------+
function Loader({ variant }: VariantProps<typeof buttonVariants>) {
  // sushi: 本專案不使用 @kiibase/i18n，固定繁體中文
  const t = (_key: 'button.loading') => '處理中';

  switch (variant) {
    case 'primary':
      return <Loader2 />;
    case 'secondary':
      return <Loader2 />;
    case 'third':
      return (
        <>
          <Loader2 />
          {t('button.loading')}
        </>
      );
    case 'subtle':
      return <Loader2 />;
    case 'destructive':
      return (
        <>
          <Loader2 />
          {t('button.loading')}
        </>
      );
    case 'destructive-secondary':
      return (
        <>
          <Loader2 />
          {t('button.loading')}
        </>
      );
    case 'icon-square':
      return <Loader2 />;
    case 'icon-circle':
      return <Loader2 />;
    case 'icon-just':
      return <Loader2 />;
    case 'link':
    case 'page':
    case 'select':
    case 'date-picker':
    case 'tab':
    case 'segment':
    case 'filter-chip':
      return null;
  }
}

export { Button, type ButtonProps };
