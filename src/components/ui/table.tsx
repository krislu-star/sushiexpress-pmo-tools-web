// 複製自 cms/apps/admin/src/components/ui（cms@0a0a5e2c，唯讀來源，plan ADR-003）；變更見檔內「sushi:」註解
import * as React from 'react';

import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
// sushi: Pages Router 不允許元件 import 全域 CSS，table.css 改由 src/pages/_app.tsx 載入

/**
 * Ensure all sub-components implement both 'root' and 'nested' variants.
 */

type TableVariants = 'root' | 'nested';

//+-----------------------------------------------------------------+
//| Table
//+-----------------------------------------------------------------+
const tableCva = cva(
  [
    'group/table',
    'relative overflow-x-auto no-scrollbar',
    '[&>table]:border-separate [&>table]:border-spacing-0',
  ],
  {
    variants: {
      variant: {
        root: [
          'bg-surface-background rounded-radius-6 border border-border-primary',
          'w-full h-auto',
          /**
           * 控制列表 Table RWD，定義在 table.css 中
           */
          'table-constraints',
          // 'min-h-[124px] max-h-[684px]',
          // see "fullscreen-controller.tsx"
          'group-[:fullscreen]/screen:max-h-screen group-[:fullscreen]/screen:h-screen',
          '[&>table]:w-max [&>table]:min-w-full',
        ],
        nested: [
          'bg-surface-background',
          // w-[100cqw]: see containerType
          'w-[100cqw]',
          // max-h-[330px]: 5 * 66px (5 row)
          '[&>table]:w-max',
          'sticky left-0',
        ],
      },
      invalid: {
        false: '',
        true: '',
      },
    },
    compoundVariants: [
      {
        variant: 'nested',
        invalid: true,
        /**
         * The <td> background reflects bg-border-error based on the data-invalid state of its child <div>.
         * Refer to <TableCell /> for the CSS :has() implementation.
         */
        className: 'clip-path-2',
      },
    ],
    defaultVariants: {
      variant: 'root',
      invalid: false,
    },
  }
);

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & VariantProps<typeof tableCva>
>(({ className, variant, invalid, ...props }, ref) => (
  <div
    className={cn(tableCva({ variant, invalid, className }))}
    style={{
      containerType: 'inline-size',
    }}
    data-invalid={invalid || undefined}
    data-variant={variant}
  >
    <table ref={ref} {...props} />
  </div>
));
Table.displayName = 'Table';

//+-----------------------------------------------------------------+
//| TableHeader
//+-----------------------------------------------------------------+
const theaderCva = cva([], {
  variants: {
    variant: {
      root: ['bg-surface-primary', 'sticky top-0', 'z-20'],
      nested: ['hidden'],
    },
  },
  defaultVariants: {
    variant: 'root',
  },
});

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> &
    VariantProps<typeof theaderCva>
>(({ className, variant, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(theaderCva({ variant, className }))}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

//+-----------------------------------------------------------------+
//| TableBody
//+-----------------------------------------------------------------+
const tbodyCva = cva(['[&_tr:last-child_td]:border-0'], {
  variants: {
    variant: {
      root: '',
      nested: '',
    },
  },
  defaultVariants: {
    variant: 'root',
  },
});

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & VariantProps<typeof tbodyCva>
>(({ className, variant, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(tbodyCva({ variant, className }))}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

//+-----------------------------------------------------------------+
//| TableFoot
//+-----------------------------------------------------------------+
const tfootCva = cva(['border-t [&>tr]:last:border-b-0'], {
  variants: {
    variant: {
      root: '',
      nested: '',
    },
  },
  defaultVariants: {
    variant: 'root',
  },
});

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & VariantProps<typeof tfootCva>
>(({ className, variant, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(tfootCva({ variant, className }))}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

//+-----------------------------------------------------------------+
//| TableRow
//+-----------------------------------------------------------------+
const rowCva = cva(['group/row'], {
  variants: {
    variant: {
      root: '',
      nested: '',
    },
    canExpand: {
      false: '',
      true: 'cursor-pointer',
    },
    isSelected: {
      false: '',
      true: '',
    },
    invalid: {
      false: '',
      true: '',
    },
  },
  defaultVariants: {
    variant: 'root',
    canExpand: false,
    isSelected: false,
    invalid: false,
  },
});

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & VariantProps<typeof rowCva>
>(({ className, variant, canExpand, isSelected, invalid, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      rowCva({
        variant,
        canExpand,
        isSelected,
        invalid,
        className,
      })
    )}
    data-can-expand={canExpand || undefined}
    data-selected={isSelected || undefined}
    data-invalid={invalid || undefined}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

//+-----------------------------------------------------------------+
//| TableHead
//+-----------------------------------------------------------------+
const headCva = cva([], {
  variants: {
    variant: {
      root: [
        'word-label-ui-medium',
        'bg-surface-primary text-text-primary border-b border-border-primary-minor',
        'text-left',
        'h-[44px] px-[15px] py-var-10 table-cell whitespace-pre',
      ],
      nested: '',
    },
    sticky: {
      left: '',
      right: '',
    },
  },
  defaultVariants: {
    variant: 'root',
    sticky: null,
  },
});

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & VariantProps<typeof headCva>
>(({ className, variant, sticky, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(headCva({ variant, sticky, className }))}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

//+-----------------------------------------------------------------+
//| TableCell
//+-----------------------------------------------------------------+
const cellCva = cva([], {
  variants: {
    variant: {
      root: [
        'bg-surface-secondary border-b border-border-primary-minor',
        'h-[80px] px-[15px]',
      ],
      nested: [
        'bg-surface-background',
        'h-[66px] px-5',
        // 'has-[div[data-invalid="true"]]:shadow-invalid',
        'has-[div[data-invalid="true"]]:bg-border-error',
      ],
    },
    sticky: {
      left: '',
      right: '',
    },
  },
  defaultVariants: {
    variant: 'root',
    sticky: null,
  },
});

type CellCvaProps = VariantProps<typeof cellCva>;

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & CellCvaProps
>(({ className, variant, sticky, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(cellCva({ variant, sticky, className }))}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

//+-----------------------------------------------------------------+
//| TableCaption
//+-----------------------------------------------------------------+
const captionCva = cva(['caption-top'], {
  variants: {
    variant: {
      root: '',
      nested: '',
    },
  },
  defaultVariants: {
    variant: 'root',
  },
});

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement> &
    VariantProps<typeof captionCva>
>(({ className, variant, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(captionCva({ variant, className }))}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

//+-----------------------------------------------------------------+
//| TableMessage
//+-----------------------------------------------------------------+
const messageCva = cva([], {
  variants: {
    variant: {
      root: ['w-[calc(100cqw-30px)] text-center', 'sticky left-[15px]'],
      nested: '',
    },
  },
  defaultVariants: {
    variant: 'root',
  },
});

const TableMessage = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> &
    VariantProps<typeof messageCva> & { colSpan: number }
>(({ colSpan, className, variant, children, ...props }, ref) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <div className={cn(messageCva({ variant, className }))} {...props}>
          {children}
        </div>
      </TableCell>
    </TableRow>
  );
});
TableMessage.displayName = 'TableMessage';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableMessage,
};

export type { TableVariants };
