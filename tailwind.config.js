/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.js",
    "./components/**/*.js",
    "./data/**/*.js"
  ],
  theme: {
    extend: {
      spacing: {
        18: "4.5rem"
      },
      zIndex: {
        1: "1"
      }
    }
  },
  plugins: []
};
