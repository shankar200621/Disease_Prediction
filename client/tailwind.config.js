/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050810',
          940: '#070b14',
          900: '#0a0f1e',
          850: '#0f1629',
          800: '#121a2e',
        },
        accent: {
          indigo: '#6366f1',
          cyan: '#22d3ee',
          violet: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      maxWidth: {
        content: '1440px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        glow: '0 0 60px -12px rgba(99, 102, 241, 0.45)',
        'glow-cyan': '0 0 50px -10px rgba(34, 211, 238, 0.35)',
        ring: '0 0 0 1px rgba(255,255,255,0.08)',
      },
      backgroundSize: {
        '300%': '300% 300%',
      },
      keyframes: {
        'gradient-flow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        aurora: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.35' },
          '33%': { transform: 'translate(8%, -4%) scale(1.08)', opacity: '0.5' },
          '66%': { transform: 'translate(-5%, 6%) scale(0.95)', opacity: '0.42' },
        },
        aurora2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.28' },
          '50%': { transform: 'translate(-12%, 8%) scale(1.12)', opacity: '0.45' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        'grid-scan': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 32px' },
        },
      },
      animation: {
        'gradient-flow': 'gradient-flow 10s ease infinite',
        aurora: 'aurora 18s ease-in-out infinite',
        'aurora-slow': 'aurora2 22s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 1.4s linear infinite',
        'grid-scan': 'grid-scan 20s linear infinite',
      },
    },
  },
  plugins: [],
};
