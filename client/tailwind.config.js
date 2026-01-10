/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        saga: {
          bg: 'var(--saga-bg)',
          accent: 'var(--saga-accent)',
          surface: 'var(--saga-surface)',
          border: 'var(--saga-border)',
          text: 'var(--saga-text)',
          'text-dim': 'var(--saga-text-dim)',
          'glass-bg': 'var(--saga-glass-bg)',
        }
      },
      fontFamily: {
        shonen: ['Bebas Neue', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
