'use client';
// 複製自 cms/apps/admin/src/components/ui（cms@0a0a5e2c，唯讀來源，plan ADR-003）；變更見檔內「sushi:」註解

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';

const switchVariant = cva(['select-none outline-none'], {
  variants: {
    variant: {
      regular: [
        // sushi: 未開啟狀態改用深灰，白色圓鈕與底色對比符合 WCAG 1.4.11（cms 原為 bg-button-secondary）
        'data-[state=checked]:bg-button-primary-hover data-[state=unchecked]:bg-achromatic-700',
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-third',
        'transition-colors',
        'rounded-radius-64',
        'w-11 h-6 px-var-2',
      ],
    },
    readonly: {
      false: '',
      true: 'opacity-50 pointer-events-none',
    },
    disabled: {
      false: '',
      true: 'opacity-50 pointer-events-none cursor-not-allowed',
    },
  },
  defaultVariants: {
    variant: 'regular',
    readonly: false,
    disabled: false,
  },
});

type SwitchCvaProps = VariantProps<typeof switchVariant>;

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & SwitchCvaProps
>(({ className, variant, readonly, disabled, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(switchVariant({ variant, readonly, disabled, className }))}
    {...props}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'rounded-full bg-icon-invert',
        'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        'transition-transform',
        'block h-5 w-5'
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
