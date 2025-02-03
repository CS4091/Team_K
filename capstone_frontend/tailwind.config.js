/** @type {import('tailwindcss').Config} */

module.exports = {
  
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/*.{js,ts,jsx,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {},
    borderWidth: {
      DEFAULT: '1px',
      '0': '0',
      '2': '2px',
      '3': '3px',
      '4': '4px',
      '6': '6px',
      '8': '8px',
    },
  },
  plugins: [],
}

