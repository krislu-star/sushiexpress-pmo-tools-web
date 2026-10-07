'use client';
// 複製自 cms/apps/admin/src/components/ui（cms@0a0a5e2c，唯讀來源，plan ADR-003）；變更見檔內「sushi:」註解

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

//+-----------------------------------------------------------------+
//| Overlay (Modal)
//+-----------------------------------------------------------------+
const overlayCva = cva(
  [
    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'fixed inset-0 z-50',
  ],
  {
    variants: {
      variant: {
        // sushi: 加上半透明遮罩，區隔對話框與背景頁面（cms 原為 bg-transparent）
        confirm: 'bg-black/40',
        table: 'bg-black/25',
        'carousel-box': 'bg-black/25',
      },
    },
    defaultVariants: {
      variant: 'confirm',
    },
  }
);

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> &
    VariantProps<typeof overlayCva>
>(({ className, variant, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(overlayCva({ variant, className }))}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

//+-----------------------------------------------------------------+
//| Content
//+-----------------------------------------------------------------+
const contentCva = cva(
  [
    'fixed z-50',
    'duration-200',
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
    'data-[state=open]:animate-in  data-[state=open]:fade-in-0  data-[state=open]:zoom-in-95',
    'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
    'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] ',
  ],
  {
    variants: {
      constraint: {
        false: 'min-w-0 max-w-none',
        true: '',
      },
      variant: {
        confirm: [
          'p-6',
          'bg-surface-secondary border border-border-primary rounded-radius-8',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'data-[state=open]:animate-in  data-[state=open]:fade-in-0  data-[state=open]:zoom-in-95',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-0',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-0',
        ],
        table: 'w-max',
        'carousel-box': 'w-max',
      },
      position: {
        top: ['left-[50%] top-[68px]', 'translate-x-[-50%]'],
        center: [
          'left-[50%] top-[50%]',
          'translate-x-[-50%] translate-y-[-50%]',
        ],
      },
    },
    compoundVariants: [
      {
        constraint: true,
        variant: 'confirm',
        className: 'min-w-[400px] max-w-[400px] min-h-[160px] max-h-[374px]',
      },
    ],
    defaultVariants: {
      constraint: true,
      variant: 'confirm',
      position: 'center',
    },
  }
);

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
    VariantProps<typeof contentCva>
>(({ className, variant, constraint, position, children, ...props }, ref) => {
  // sushi: 移除 cms 的全螢幕容器（fullscreen-controller），固定渲染到 body
  return (
    <DialogPortal>
      <DialogOverlay variant={variant} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(contentCva({ constraint, variant, position, className }))}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

//+-----------------------------------------------------------------+
//| Body
//+-----------------------------------------------------------------+
const bodyCva = cva([], {
  variants: {
    constraint: {
      false: '',
      true: '',
    },
    variant: {
      confirm: 'relative overflow',
    },
  },
  compoundVariants: [
    {
      constraint: true,
      variant: 'confirm',
      className: 'max-h-[190px]',
    },
  ],
  defaultVariants: {
    constraint: true,
    variant: 'confirm',
  },
});

const DialogBody = ({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof bodyCva>) => (
  <div className={cn(bodyCva({ variant, className }))} {...props} />
);
DialogBody.displayName = 'DialogBody';

//+-----------------------------------------------------------------+
//| Header
//+-----------------------------------------------------------------+
const headerCva = cva([], {
  variants: {
    constraint: {
      false: '',
      true: '',
    },
    variant: {
      confirm: ['flex flex-col gap-2', 'pb-4'],
      table: '',
      'carousel-box': '',
    },
  },
  compoundVariants: [
    {
      constraint: true,
      variant: 'confirm',
      className: 'w-[352px] min-h-4 max-h-[220px]',
    },
  ],
  defaultVariants: {
    constraint: true,
    variant: 'confirm',
  },
});

const DialogHeader = ({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof headerCva>) => (
  <div className={cn(headerCva({ variant, className }))} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

//+-----------------------------------------------------------------+
//| Footer
//+-----------------------------------------------------------------+
const footerCva = cva([], {
  variants: {
    constraint: {
      false: '',
      true: '',
    },
    variant: {
      confirm: ['flex justify-end gap-2 pt-4'],
      table: '',
      'carousel-box': '',
    },
  },
  compoundVariants: [
    {
      constraint: true,
      variant: 'confirm',
      className: 'h-14',
    },
  ],
  defaultVariants: {
    constraint: true,
    variant: 'confirm',
  },
});

const DialogFooter = ({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof footerCva>) => (
  <div className={cn(footerCva({ variant, className }))} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

//+-----------------------------------------------------------------+
//| Title
//+-----------------------------------------------------------------+
const titleCva = cva([], {
  variants: {
    variant: {
      confirm: ['word-label-ui-bold', 'text-text-primary'],
      table: '',
      'carousel-box': '',
    },
  },
  defaultVariants: {
    variant: 'confirm',
  },
});

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> &
    VariantProps<typeof titleCva>
>(({ className, variant, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(titleCva({ variant, className }))}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

//+-----------------------------------------------------------------+
//| Description
//+-----------------------------------------------------------------+
const descriptionCva = cva([], {
  variants: {
    variant: {
      confirm: [
        'word-subtle text-text-secondary',
        'line-clamp-2 whitespace-pre-wrap',
      ],
      table: '',
      'carousel-box': '',
    },
  },
  defaultVariants: {
    variant: 'confirm',
  },
});

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> &
    VariantProps<typeof descriptionCva>
>(({ className, variant, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(descriptionCva({ variant, className }))}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
