/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme: {
          light: {
            bg: '#FDFBF7',
            card: '#FFFFFF',
            text: '#2D3748',
            muted: '#718096',
            border: '#E2E8F0',
            accent: '#C05621',
            accentBg: '#FEEBC8'
          },
          sepia: {
            bg: '#F4ECD8',
            card: '#E9DFC7',
            text: '#4A3728',
            muted: '#7A6451',
            border: '#D8C9B0',
            accent: '#8C4303',
            accentBg: '#E3CFAB'
          },
          dark: {
            bg: '#1A202C',
            card: '#2D3748',
            text: '#E2E8F0',
            muted: '#A0AEC0',
            border: '#4A5568',
            accent: '#ED8936',
            accentBg: '#2C3748'
          }
        },
        saffron: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
        heading: ['"Rozha One"', '"Noto Sans Devanagari"', 'serif'],
      },
    },
  },
  plugins: [],
}
