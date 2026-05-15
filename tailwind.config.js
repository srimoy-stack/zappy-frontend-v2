/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4dbe7e',
          light: '#7edba1',
          dark: '#3a9b65',
        },
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#4dbe7e',
          600: '#3a9b65',
          700: '#2d7a4f',
          900: '#1e5235',
        },
        success: {
          50: '#f0fdf4',
          500: '#4dbe7e',
          700: '#3a9b65',
        }
      }
    },
  },
  plugins: [],
}
