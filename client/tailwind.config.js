/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#0d1117',
        surface: '#161b22',
        border: '#30363d',
        primary: '#3b82f6',
      }
    },
  },
  plugins: [],
}
