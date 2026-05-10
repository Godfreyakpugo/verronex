/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],

  theme: {
    extend: {
      colors: {
        brand: "#d946ef"
      },
      fontFamily: {
      // This stack gives you the Apple look immediately
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
    },
    },
  },

  plugins: [],
}