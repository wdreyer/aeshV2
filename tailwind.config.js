module.exports = {
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      backgroundColor: {
        'fad4d8': '#FAD4D8',
        'dark-blue': '#281C47',
        'pink-custom': '#FAD4D8',
      },
      textColor: {
        'fad4d8': '#FAD4D8',
      },
      width: {
        'planning' : '500px',
        'settings' : '900px',
        'dashboard' : '400px'
      },
      gradientColorStops: {
        'pink-custom': '#FAD4D8',
      },
    },
  },
  content: [
    './pages/**/*.{html,js}',
    './components/**/*.{html,js}'
  ],
  variants: {
    extend: {},
  },
  plugins: [],
}