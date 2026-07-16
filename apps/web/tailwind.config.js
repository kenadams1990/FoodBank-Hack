/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0d5c63',
          light: '#14919b',
          dark: '#094248',
        },
        accent: {
          DEFAULT: '#ff6b35',
          light: '#ff8c5a',
        }
      }
    },
  },
  plugins: [],
};
