import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#F5F5F7',
        'bg-dark': '#1D1D1F',
        'bg-card': '#FFFFFF',

        // Texts
        'text-primary': '#1D1D1F',
        'text-secondary': '#6E6E73',
        'text-tertiary': '#AEAEB2',
        'text-inverted': '#FFFFFF',

        // Accents
        accent: '#0071E3',
        'accent-hover': '#0077ED',
        'accent-dark': '#0051A2',

        // Semantic
        success: '#34C759',
        warning: '#FF9F0A',
        danger: '#FF3B30',
        info: '#5AC8FA',

        // Borders
        border: '#D2D2D7',
        'border-strong': '#AEAEB2',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },

      fontSize: {
        // Body — same as Apple.com
        body: ['17px', { lineHeight: '1.6', fontWeight: '400' }],
        // Labels
        label: ['14px', { lineHeight: '1.4', fontWeight: '500' }],
      },

      borderRadius: {
        ios: '18px',   // iOS icon radius — product cards
        base: '10px',  // Badges, inputs
        pill: '980px', // Full pill — Apple-style buttons
      },

      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.08)',
        'elevated': '0 4px 24px rgba(0,0,0,0.12)',
        'floating': '0 8px 40px rgba(0,0,0,0.16)',
        'accent-glow': '0 4px 16px rgba(0,113,227,0.3)',
      },

      backdropBlur: {
        glass: '20px',
      },

      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },

      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },

      // Letter spacing — Apple uses very tight tracking on display titles
      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.02em',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
