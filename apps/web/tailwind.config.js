/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        ink:    '#0B2027',
        brand: {
          DEFAULT: '#0E7C86',
          deep:    '#094248',
        },
        surface: '#F4F7F7',
        line:    '#DDE6E6',
        impact:  '#F26A4B',
        warn:    '#E8B23A',
        alert:   '#D64545',
        ok:      '#2E9E7B',
        // Legacy aliases kept so existing pages don't break
        accent: {
          DEFAULT: '#F26A4B',
          light:   '#F48A6E',
        },
      },
      fontFamily: {
        display: ['Archivo', 'sans-serif'],
        sans:    ['IBM Plex Sans', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-in': 'slideIn 0.4s ease forwards',
        'fade-up': 'fadeUp 0.5s ease forwards',
      },
      keyframes: {
        slideIn: {
          '0%':   { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        fadeUp: {
          '0%':   { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
