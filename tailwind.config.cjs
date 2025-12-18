/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#121212',
          800: '#1e1e1e',
          700: '#2d2d2d',
        },
        primary: '#3b82f6',
        danger: '#ef4444'
      }
    },
  },
  plugins: [],
}
