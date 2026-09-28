/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#18352d',
        citrus: '#e6f28c',
        coral: '#e17651',
        paper: '#f2f4ec',
      },
    },
  },
  plugins: [],
}