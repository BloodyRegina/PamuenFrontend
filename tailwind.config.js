/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Google Sans"', 'sans-serif'],
      },
      colors: {
        primary: {
          light: '#f3e8ff', // purple-100
          DEFAULT: '#c084fc', // purple-400
          dark: '#a855f7', // purple-500
        },
        secondary: {
          light: '#fbcfe8', // pink-200
          DEFAULT: '#f472b6', // pink-400
          dark: '#db2777', // pink-600
        },
        background: '#ffffff',
        surface: '#f8fafc', // slate-50
      },
    },
  },
  plugins: [],
}
