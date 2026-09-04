/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101010',
        'action-blue': '#0099ff',
        paper: '#f4f4f4',
        graphite: '#242424',
        slate: '#6b7280',
        stone: '#898989',
        silver: '#e5e7eb',
        'info-banner': '#eff6fe',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'Cal Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['64px', { lineHeight: '1.1', letterSpacing: '0.64px', fontWeight: '600' }],
        'heading-lg': ['48px', { lineHeight: '1.1', letterSpacing: '0.48px', fontWeight: '600' }],
        heading: ['24px', { lineHeight: '1.3', letterSpacing: '0.24px', fontWeight: '600' }],
        'heading-sm': ['20px', { lineHeight: '1.3', letterSpacing: '0.2px', fontWeight: '600' }],
        subheading: ['18px', { lineHeight: '1.4', letterSpacing: '-0.2px', fontWeight: '300' }],
        body: ['16px', { lineHeight: '1.5', letterSpacing: '-0.19px', fontWeight: '300' }],
        'body-sm': ['14px', { lineHeight: '1.5', letterSpacing: '-0.2px', fontWeight: '300' }],
        caption: ['12px', { lineHeight: '1.4', letterSpacing: '-0.24px', fontWeight: '300' }],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        pill: '9999px',
      },
      maxWidth: {
        content: '1200px',
      },
      boxShadow: {
        'sm-4': 'rgba(34, 42, 53, 0.05) 0px 4px 8px 0px',
        sm: 'rgba(36, 36, 36, 0.7) 0px 1px 5px -4px, rgba(36, 36, 36, 0.05) 0px 4px 8px 0px',
      },
    },
  },
  plugins: [],
}