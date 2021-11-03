const colors = require('tailwindcss/colors')
console.log('🚀 ~ file: tailwind.config.js ~ line 2 ~ colors', colors)

module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        ...colors,
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
