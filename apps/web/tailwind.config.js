/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // ── Tide palette (Control Tower — brand guidelines p.06) ──
        'slate-ink': '#1C2B2C', // page background
        'deep-tide': '#123B41', // panel / surface
        'raised':    '#16333A', // raised surface
        salmon:      '#E8654A', // accent / single signal per screen
        'salmon-hi': '#EF7D66', // hover
        foam:        '#F1F7F5', // text on dark
        mist:        '#B9C4CC', // secondary text
        fog:         '#D8E3E0',
        ink:         '#0B0F13', // deepest surface — topbar/hero
        success:     '#3F6B4F',
        'success-hi':'#7FA98C',
        warning:     '#E8A33C',
        danger:      '#C4432E',
        'danger-hi': '#E4715A',

        // ── Semantic aliases used across existing markup ──
        // Remapped to Tide so class names like text-impact / bg-brand keep working.
        brand: {
          DEFAULT: '#123B41', // was teal; now the panel tide
          deep:    '#0B0F13',
        },
        impact:  '#E8654A', // headline metric accent → salmon
        surface: '#123B41', // was light; now panel
        line:    'rgba(241,247,245,.08)',
        warn:    '#E8A33C',
        alert:   '#C4432E',
        ok:      '#3F6B4F',
        accent: {
          DEFAULT: '#E8654A',
          light:   '#EF7D66',
        },

        // ── Legacy light/teal values, explicitly namespaced (do not use) ──
        legacy: {
          teal:    '#0E7C86',
          ink:     '#0B2027',
          surface: '#F4F7F7',
          line:    '#DDE6E6',
          coral:   '#F26A4B',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans:    ['IBM Plex Mono', 'monospace'], // body is mono in the Tide system
        mono:    ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '2px',
        md: '4px',
      },
      letterSpacing: {
        label: '0.28em',
      },
      animation: {
        'pulse-slow': 'tlPulse 3s cubic-bezier(0.2,0.8,0.2,1) infinite',
        'slide-in': 'slideIn 0.2s ease forwards',
        'fade-up': 'fadeUp 0.2s ease forwards',
      },
      keyframes: {
        tlPulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '.35' },
        },
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
