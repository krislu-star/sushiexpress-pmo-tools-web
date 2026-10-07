// 複製自 cms/packages/design/tailwind.config.ts（cms@0a0a5e2c，plan ADR-003）；變更見「sushi:」註解
import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';
import animate from 'tailwindcss-animate';
import { i18nWord } from './tailwind.plugin';

const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      screens: {
        '2xl': '1440px',
        '3xl': '1920px',
      },
      colors: {
        achromatic: {
          100: 'var(--color-achromatic-100)',
          200: 'var(--color-achromatic-200)',
          300: 'var(--color-achromatic-300)',
          400: 'var(--color-achromatic-400)',
          500: 'var(--color-achromatic-500)',
          600: 'var(--color-achromatic-600)',
          700: 'var(--color-achromatic-700)',
          800: 'var(--color-achromatic-800)',
          900: 'var(--color-achromatic-900)',
        },
        error: {
          100: 'var(--color-error-100)',
          200: 'var(--color-error-200)',
          300: 'var(--color-error-300)',
        },
        primary: {
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
        },
        success: {
          100: 'var(--color-success-100)',
          200: 'var(--color-success-200)',
        },
        warning: {
          100: 'var(--color-warning-100)',
          200: 'var(--color-warning-200)',
        },
        // sushi: 品牌主色 #E95529（頂欄、品牌字等裝飾用途；按鈕與文字用 primary-500 以符合 AA 對比）
        brand: 'var(--color-brand)',
        // Token
        border: {
          error: 'var(--color-error-300)',
          brand: 'var(--color-primary-500)',
          warning: 'var(--color-warning-200)',
          primary: 'var(--color-achromatic-500)',
          'primary-minor': 'var(--color-achromatic-400)',
          secondary: 'var(--color-primary-300)',
          'secondary-minor': 'var(--color-primary-200)',
          success: 'var(--color-success-200)',
          third: 'var(--color-primary-400)',
        },
        button: {
          error: 'var(--color-error-300)',
          'error-hover': 'var(--color-error-200)',
          'error-invert': 'var(--color-achromatic-100)',
          'error-invert-hover': 'var(--color-error-100)',
          disable: 'var(--color-achromatic-500)',
          'icon-default': 'var(--color-achromatic-800)',
          invert: 'var(--color-achromatic-100)',
          'invert-hover': 'var(--color-primary-100)',
          primary: 'var(--color-primary-500)',
          'primary-hover': 'var(--color-primary-400)',
          secondary: 'var(--color-primary-200)',
          'secondary-disable': 'var(--color-achromatic-300)',
          'secondary-hover': 'var(--color-primary-300)',
          third: 'var(--color-primary-100)',
        },
        hint: {
          default: 'var(--color-achromatic-100)',
          error: 'var(--color-error-100)',
          warning: 'var(--color-warning-100)',
          success: 'var(--color-success-100)',
        },
        icon: {
          error: 'var(--color-error-300)',
          warning: 'var(--color-warning-200)',
          brand: 'var(--color-primary-500)',
          invert: 'var(--color-achromatic-100)',
          primary: 'var(--color-achromatic-800)',
          // sushi: 改用 700，圖示對比符合 WCAG 1.4.11（cms 原為 600）
          secondary: 'var(--color-achromatic-700)',
          success: 'var(--color-success-200)',
        },
        surface: {
          background: 'var(--color-achromatic-200)',
          brand: 'var(--color-primary-400)',
          primary: 'var(--color-primary-100)',
          secondary: 'var(--color-achromatic-100)',
        },
        tab: {
          primary: 'var(--color-tab-primary)',
          secondary: 'var(--color-tab-secondary)',
          'state-active': 'var(--color-tab-state-active)',
        },
        text: {
          error: 'var(--color-error-300)',
          brand: 'var(--color-primary-500)',
          // sushi: 改用 700（#737373），對白底 4.74:1 符合 WCAG AA（cms 原為 600）
          default: 'var(--color-achromatic-700)',
          warning: 'var(--color-warning-200)',
          invert: 'var(--color-achromatic-100)',
          primary: 'var(--color-achromatic-900)',
          secondary: 'var(--color-achromatic-800)',
          success: 'var(--color-success-200)',
          third: 'var(--color-primary-400)',
        },
      },
      borderRadius: {
        'radius-4': 'var(--radius-4)',
        'radius-6': 'var(--radius-6)',
        'radius-8': 'var(--radius-8)',
        'radius-64': 'var(--radius-64)',
      },
      spacing: {
        'var-2': 'var(--variate-2)',
        'var-3': 'var(--variate-3)',
        'var-4': 'var(--variate-4)',
        'var-6': 'var(--variate-6)',
        'var-8': 'var(--variate-8)',
        'var-10': 'var(--variate-10)',
        'var-12': 'var(--variate-12)',
        'var-14': 'var(--variate-14)',
        'var-16': 'var(--variate-16)',
        'var-20': 'var(--variate-20)',
        'var-24': 'var(--variate-24)',
        'var-28': 'var(--variate-28)',
        'var-36': 'var(--variate-36)',
        'var-64': 'var(--variate-64)',
      },
      boxShadow: {
        'button-notice': 'var(--button-notice-shadow)',
        sidebar: 'var(--sidebar-shadow)',
        select: 'var(--select-shadow)',
        'toast-info': 'var(--shadow-toast-info)',
        'toast-success': 'var(--shadow-toast-success)',
        'toast-warning': 'var(--shadow-toast-warning)',
        'toast-error': 'var(--shadow-toast-error)',
        invalid: 'var(--invalid-shadow)',
        rtd: 'inset 1px 0 0 0 rgba(0,0,0,0.1)',
        ltd: 'inset -1px 0 0 0 rgba(0,0,0,0.1)',
        ttr: 'inset 0 1px 0 0 rgba(0,0,0,0.1)',
        btr: 'inset 0 -1px 0 0 rgba(0,0,0,0.1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'circle-small': {
          from: {
            transform:
              'translate(var(--circle-small-from-x),var(--circle-small-from-y))',
          },
          to: {
            transform:
              'translate(var(--circle-small-to-x),var(--circle-small-to-y))',
          },
        },
        'circle-medium': {
          from: {
            transform:
              'translate(var(--circle-medium-from-x),var(--circle-medium-from-y))',
          },
          to: {
            transform:
              'translate(var(--circle-medium-to-x),var(--circle-medium-to-y))',
          },
        },
        'circle-large': {
          from: {
            transform:
              'translate(var(--circle-large-from-x),var(--circle-large-from-y))',
          },
          to: {
            transform:
              'translate(var(--circle-large-to-x),var(--circle-large-to-y))',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'circle-small': 'circle-small 0.8s infinite ease-in-out alternate',
        'circle-medium': 'circle-medium 0.8s infinite ease-in-out alternate',
        'circle-large': 'circle-large 0.8s infinite ease-in-out alternate',
      },
      fontFamily: {
        'sans-zh': ['var(--font-noto-sans-tc)', ...fontFamily.sans],
      },
    },
  },
  plugins: [animate, i18nWord],
} satisfies Config;

export default config;
