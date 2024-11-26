/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          light: "#F7F7F7",
          DEFAULT: "#D1D1D1",
          dark: "#A0A0A0",
        },
      },
    },
  },
  plugins: [],
}

