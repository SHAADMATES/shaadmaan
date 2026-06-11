/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          light: '#1c2541',
          DEFAULT: '#0b132b',
          dark: '#0a0f1d',
        },
        royal: {
          light: '#48cae4',
          DEFAULT: '#0077b6',
          dark: '#03045e',
        },
        cyan: {
          light: '#e0f7fa',
          DEFAULT: '#00b4d8',
          dark: '#0097a7',
        },
        gold: {
          light: '#fef08a',
          DEFAULT: '#ffb703',
          dark: '#d97706',
        },
        emerald: {
          light: '#d1fae5',
          DEFAULT: '#2a9d8f',
          dark: '#06d6a0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
