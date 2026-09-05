/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#ea580c',
        'brand-deep': '#c2410c',
        'brand-soft': '#ffedd5',
        accent: '#f59e0b',
        'accent-deep': '#b45309',
        'accent-soft': '#fef3c7',
        ink: '#1a150f',
        'action-blue': '#0099ff',
        paper: '#faf7f2',
        cream: '#fffdf8',
        graphite: '#3d3428',
        slate: '#6b6259',
        stone: '#98907f',
        silver: '#e6e0d6',
        'info-banner': '#eff6fe',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'Cal Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['64px', { lineHeight: '1.1', letterSpacing: '0.64px', fontWeight: '700' }],
        'heading-lg': ['48px', { lineHeight: '1.1', letterSpacing: '0.48px', fontWeight: '700' }],
        heading: ['24px', { lineHeight: '1.3', letterSpacing: '0.24px', fontWeight: '600' }],
        'heading-sm': ['20px', { lineHeight: '1.3', letterSpacing: '0.2px', fontWeight: '600' }],
        subheading: ['18px', { lineHeight: '1.4', letterSpacing: '-0.2px', fontWeight: '400' }],
        body: ['16px', { lineHeight: '1.5', letterSpacing: '-0.19px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', letterSpacing: '-0.2px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.4', letterSpacing: '-0.24px', fontWeight: '500' }],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
        pill: '9999px',
      },
      maxWidth: {
        content: '1200px',
      },
      boxShadow: {
        'sm-4': 'rgba(90, 60, 30, 0.06) 0px 4px 12px 0px',
        sm: 'rgba(60, 30, 0, 0.18) 0px 1px 5px -4px, rgba(90, 60, 30, 0.06) 0px 4px 12px 0px',
        card: 'rgba(120, 80, 40, 0.05) 0px 1px 2px 0px, rgba(120, 80, 40, 0.08) 0px 4px 12px 0px',
        'card-hover':
          'rgba(154, 52, 18, 0.12) 0px 8px 16px -4px, rgba(120, 80, 40, 0.12) 0px 18px 32px -8px',
        'brand-glow': '0 10px 30px -10px rgba(234, 88, 12, 0.55)',
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, #7c2d12 0%, #ea580c 48%, #f59e0b 100%)',
        'navbar-gradient':
          'linear-gradient(90deg, #fffdf8 0%, #ffedd5 50%, #fde6d0 100%)',
        'card-gradient':
          'linear-gradient(180deg, #ffffff 0%, #fff8f0 100%)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.33, 1, 0.68, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.33, 1, 0.68, 1) both',
        'fade-in': 'fade-in 0.35s ease-out both',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
}