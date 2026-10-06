/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        instrument: ['"Instrument Serif"', 'Georgia', 'serif'],
        inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        background: '#FFFFFF',
        warmBg: '#FAF8F5',
        textDark: '#000000',
        mutedGray: '#6F6F6F',
        subtleBorder: '#E7E5E2',
        subtleCard: '#F7F6F3',
      },
      letterSpacing: {
        headline: '-2.46px',
        editorial: '-0.02em',
      },
      lineHeight: {
        headline: '0.95',
      },
      keyframes: {
        'fade-rise': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ai-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 0, 0, 0.08)' },
          '50%': { boxShadow: '0 0 25px rgba(0, 0, 0, 0.18)' },
        },
      },
      animation: {
        'fade-rise': 'fade-rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-rise-delay': 'fade-rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards',
        'fade-rise-delay-2': 'fade-rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards',
        'ai-glow': 'ai-glow 3s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
