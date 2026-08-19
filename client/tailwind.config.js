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
          50: '#f0fdf7',
          100: '#dcfceb',
          200: '#bbf7d8',
          300: '#86efbe',
          400: '#4ade9f',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#0D5C46', // Primary deep green from reference design
          900: '#084333', // Deep hover green
          950: '#04281f',
        },
        cream: {
          50: '#FFFFFF',
          100: '#FCFBF9',
          200: '#FBF9F5', // Reference background
          300: '#F5F1E9',
          400: '#EBE5D8',
          500: '#DED6C4',
        },
        charcoal: {
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'soft-lg': '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
        'card': '0 4px 20px -2px rgba(13, 92, 70, 0.08)',
      },
    },
  },
  plugins: [],
}
