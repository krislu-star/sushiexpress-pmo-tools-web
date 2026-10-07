// 複製自 cms/packages/design/tailwind.plugin.ts（cms@0a0a5e2c）
import plugin from 'tailwindcss/plugin';

const i18nWord = plugin(function ({ addUtilities }) {
  addUtilities({
    // just intellisense
    '.no-scrollbar': {},

    // word
    '.word-h1': {
      fontSize: '48px',
      fontWeight: '900',
      lineHeight: '48px',
      letterSpacing: '-0.012em',
    },
    '.word-h2': {
      fontSize: '30px',
      fontWeight: '400',
      lineHeight: '36px',
      letterSpacing: '-0.0075em',
    },
    '.word-h3': {
      fontSize: '24px',
      fontWeight: '700',
      lineHeight: '32px',
      letterSpacing: '-0.006em',
    },
    '.word-h4': {
      fontSize: '20px',
      fontWeight: '400',
      lineHeight: '28px',
      letterSpacing: '-0.005em',
    },
    '.word-title': {
      fontSize: '28px',
      fontWeight: '500',
      lineHeight: '48px',
      letterSpacing: '4px',
    },
    '.word-large': {
      fontSize: '18px',
      fontWeight: '400',
      lineHeight: '28px',
    },
    '.word-lead': {
      fontSize: '20px',
      fontWeight: '400',
      lineHeight: '28px',
    },
    '.word-label': {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '28px',
    },
    '.word-label-ui': {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '24px',
    },
    '.word-label-ui-medium': {
      fontSize: '16px',
      fontWeight: '500',
      lineHeight: '24px',
    },
    '.word-label-ui-bold': {
      fontSize: '16px',
      fontWeight: '700',
      lineHeight: '16px',
      letterSpacing: '0.05em',
    },
    '.word-list': {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '24px',
    },
    '.word-body': {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '24px',
      letterSpacing: '0.01em',
    },
    '.word-body-medium': {
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '24px',
      letterSpacing: '0.01em',
    },
    '.word-subtle': {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20px',
    },
    '.word-subtle-medium': {
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '20px',
    },
    '.word-subtle-semibold': {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20px',
    },
    '.word-small': {
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '14px',
    },
    '.word-detail': {
      fontSize: '12px',
      fontWeight: '500',
      lineHeight: '20px',
    },
    '.word-blockquote': {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '24px',
    },
    '.word-inline-code': {
      fontSize: '14px',
      fontWeight: '700',
      lineHeight: '20px',
    },
    '.word-table-head': {
      fontSize: '16px',
      fontWeight: '500',
      lineHeight: '24px',
    },
    '.word-table-item': {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '24px',
    },
    '.word-original-item': {
      fontSize: '16px',
      fontWeight: '500',
      lineHeight: '24px',
    },
    '.word-original-mark': {
      fontSize: '16px',
      fontWeight: '700',
      lineHeight: '24px',
    },
    '.word-original-title': {
      fontSize: '28px',
      fontWeight: '500',
      lineHeight: '48px',
      letterSpacing: '4px',
    },
    '.word-original-button': {
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '24px',
    },
    '.word-original-description': {
      fontSize: '14px',
      fontWeight: '400',
      letterSpacing: '1px',
    },
    '.word-original-button-2': {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '24px',
    },
    '.word-original-item-2': {
      fontSize: '14px',
      fontWeight: '700',
      lineHeight: '20px',
      letterSpacing: '0.05em',
    },
  });
});

export { i18nWord };
