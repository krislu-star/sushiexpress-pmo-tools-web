'use client';
// 複製自 cms/apps/admin/src/components/ui（cms@0a0a5e2c，唯讀來源，plan ADR-003）；變更見檔內「sushi:」註解

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const selectTriggerVariant = cva(['outline-none', 'relative'], {
  variants: {
    variant: {
      input: [
        'group',
        'word-body',
        'bg-surface-secondary text-text-primary border border-border-primary rounded-radius-6',
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-third',
        'focus:ring-2 focus:ring-offset-2 focus:ring-border-third',
        'h-10 pl-3 pr-9 py-2 min-w-[90px] w-full',
        'flex items-center',
      ],
    },
    placeholder: {
      false: '',
      true: 'text-text-default',
    },
    disabled: {
      false: '',
      true: 'opacity-50 cursor-not-allowed',
    },
    invalid: {
      false: '',
      true: 'ring-2 ring-offset-2 ring-border-error focus-visible:ring-border-error focus:ring-border-error',
    },
  },
  defaultVariants: {
    variant: 'input',
    placeholder: false,
    disabled: false,
    invalid: false,
  },
});

type SelectTriggerVariant = VariantProps<typeof selectTriggerVariant>;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> &
    SelectTriggerVariant
>(
  (
    { className, children, variant, placeholder, disabled, invalid, ...props },
    ref
  ) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        selectTriggerVariant({
          variant,
          placeholder,
          disabled,
          invalid,
          className,
        })
      )}
      {...props}
    >
      <span className={cn('line-clamp-1 text-left')}>{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          size={16}
          className={cn(
            'flex-shrink-0 text-icon-secondary',
            'transition-transform group-data-[state=open]:rotate-180',
            'absolute right-3'
          )}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

// not being used
const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

// not being used
const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => {
  // sushi: 移除 cms 的全螢幕容器（fullscreen-controller），固定渲染到 body
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          'rounded-radius-8 border border-border-primary-minor',
          'overflow-hidden bg-scroll shadow-select',
          'min-w-10',
          'z-50',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
        )}
        avoidCollisions={true}
        position={position}
        sideOffset={6}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={cn(
            'word-subtle-medium',
            'bg-surface-secondary text-text-primary',
            'max-h-[276px] w-full min-w-[calc(var(--radix-select-trigger-width)-2px)]',
            'px-var-8 py-var-10',
            'overflow-y-auto overflow-x-hidden'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

// not being used
const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const selectItemVariant = cva(
  [
    'word-subtle-medium',
    'select-none outline-none cursor-default',
    'text-text-primary rounded-radius-6',
    'hover:bg-button-invert-hover',
    'focus:bg-button-invert-hover',
    'flex items-center min-h-8 pr-2 pl-8',
    'relative',
    'group',
  ],
  {
    variants: {
      variant: {},
    },
    defaultVariants: {},
  }
);

type SelectItemVariant = VariantProps<typeof selectItemVariant>;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> &
    SelectItemVariant
>(({ className, variant, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(selectItemVariant({ variant, className }))}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check size={16} className={cn('text-icon-brand')} />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

// not being used
const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('bg-muted -mx-1 my-1 h-px', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
