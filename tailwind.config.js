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
        '2xl': '29px',
        '3xl': '100px',
        '4xl': '120px',
        '5xl': '1000px',
        pill: '9999px',
      },
      maxWidth: {
        content: '1200px',
      },
      boxShadow: {
        sm: 'rgba(36, 36, 36, 0.7) 0px 1px 5px -4px, rgba(36, 36, 36, 0.05) 0px 4px 8px 0px',
        subtle: 'rgba(255, 255, 255, 0.15) 0px 2px 0px 0px inset',
        'sm-2':
          'rgba(19, 19, 22, 0.7) 0px 1px 5px -4px, rgba(34, 42, 53, 0.1) 0px 0px 0px 1px, rgba(34, 42, 53, 0.05) 0px 4px 8px 0px',
        'sm-3':
          'rgba(19, 19, 22, 0.7) 0px 1px 5px -4px, rgba(34, 42, 53, 0.08) 0px 0px 0px 1px, rgba(34, 42, 53, 0.05) 0px 4px 8px 0px',
        'sm-4': 'rgba(34, 42, 53, 0.05) 0px 4px 8px 0px',
        'subtle-2': 'rgb(255, 255, 255) 0px 2px 0px 0px inset',
        'subtle-3':
          'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 0px 2px 0px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.33, 1, 0.68, 1)',
      },
    },
  },
  plugins: [],
}