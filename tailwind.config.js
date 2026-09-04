/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'warm-cream': '#F3F0EE',
        'lifted-cream': '#FCFBFA',
        'soft-bone': '#F4F4F4',
        'ink-black': '#141413',
        charcoal: '#262627',
        'slate-gray': '#696969',
        granite: '#555555',
        'dust-taupe': '#D1CDC7',
        'signal-orange': '#CF4500',
        'light-signal-orange': '#F37338',
        'mastercard-red': '#EB001B',
        'mastercard-yellow': '#F79E1B',
        'link-blue': '#3860BE',
        'clay-brown': '#9A3A0A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'h1-hero': ['64px', { lineHeight: '64px', letterSpacing: '0', fontWeight: '700' }],
        'h2-section': ['36px', { lineHeight: '44px', letterSpacing: '0', fontWeight: '600' }],
        'h3-card': ['24px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '500' }],
        'h4-subhead': ['14px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '500' }],
        eyebrow: ['14px', { lineHeight: '14px', letterSpacing: '0.05em', fontWeight: '600' }],
        body: ['16px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'body-lg': ['20px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
      },
      borderRadius: {
        sm: '0px',
        md: '4px',
        lg: '9px',
        xl: '6px',
        pill: '9999px',
      },
      spacing: {
        4: '4px',
        8: '8px',
        12: '12px',
        16: '16px',
        20: '20px',
        24: '24px',
        32: '32px',
        40: '40px',
        48: '48px',
        64: '64px',
        80: '80px',
        128: '128px',
      },
      maxWidth: {
        content: '1200px',
      },
      boxShadow: {
        ambient: '0 4px 24px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
