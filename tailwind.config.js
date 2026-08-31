/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#f8f9ff',
        'surface-dim': '#d8dae0',
        'studio-white': '#FFFFFF',
        charcoal: {
          DEFAULT: '#1A1C1E',
          deep: '#1A1C1E',
        },
        'on-surface': '#191c20',
        'on-surface-variant': '#44474a',
        digital: {
          blue: '#0052FF',
          600: '#0038b6',
        },
        'surface-muted': '#F1F3F7',
        outline: '#75777a',
        'on-background': '#191c20',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '1.1', letterSpacing: '0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '1.2', letterSpacing: '0.01em', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '1.3', letterSpacing: '0.01em', fontWeight: '500' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-sm': ['12px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '1rem',
      },
      boxShadow: {
        float: '0 12px 32px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
