'use client';
// 複製自 cms/apps/admin/src/components/ui（cms@0a0a5e2c，唯讀來源，plan ADR-003）；變更見檔內「sushi:」註解

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';

const tabsVariant = cva([], {
  variants: {
    variant: {
      regular: ['bg-transparent'],
    },
  },
  defaultVariants: {
    variant: 'regular',
  },
});

type TabsCvaProps = VariantProps<typeof tabsVariant>;

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & TabsCvaProps
>(({ className, variant, ...props }, ref) => {
  return (
    <TabsPrimitive.Root
      ref={ref}
      className={tabsVariant({ variant, className })}
      {...props}
    />
  );
});
Tabs.displayName = 'Tabs';

const tabsListVariant = cva([], {
  variants: {
    variant: {
      regular: ['min-h-[52px]', 'flex flex-wrap items-center gap-var-2'],
    },
  },
  defaultVariants: {
    variant: 'regular',
  },
});

type TabsListCvaProps = VariantProps<typeof tabsListVariant>;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & TabsListCvaProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariant({ variant, className }))}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = TabsPrimitive.Trigger;

const tabsContentVariant = cva(['outline-none'], {
  variants: {
    variant: {
      regular: ['px-5 py-6', 'bg-surface-secondary'],
    },
  },
  defaultVariants: {
    variant: 'regular',
  },
});

type TabsContentCvaProps = VariantProps<typeof tabsContentVariant>;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> &
    TabsContentCvaProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={tabsContentVariant({ variant, className })}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
