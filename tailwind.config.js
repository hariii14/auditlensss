/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FBFBF9',
          100: '#F7F7F4',
          200: '#ECECE8',
          300: '#DEDFD8',
          400: '#C2C4B8',
        },
        charcoal: {
          900: '#141713',
          800: '#20231F',
          700: '#2F342E',
          600: '#4A5048',
          500: '#6C736A',
          400: '#949B92',
        },
        forest: {
          900: '#0C3828',
          800: '#11523B',
          700: '#176B4D',
          600: '#1E8761',
          500: '#27A578',
          100: '#E4F4ED',
          50: '#F0F9F5',
        },
        lime: {
          accent: '#C7E46B',
          soft: '#EAF4CA',
        },
        cobalt: {
          900: '#162F9C',
          800: '#1E42D9',
          600: '#2B59FF',
          500: '#4872FF',
          100: '#EBF0FF',
          50: '#F4F7FF',
        },
        alert: {
          red: '#DC2626',
          redBg: '#FEF2F2',
          redBorder: '#FECACA',
          amber: '#D97706',
          amberBg: '#FFFBEB',
          amberBorder: '#FDE68A',
          green: '#16A34A',
          greenBg: '#F0FDF4',
          greenBorder: '#BBF7D0',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(20, 23, 19, 0.05), 0 1px 2px -1px rgba(20, 23, 19, 0.05)',
        'card': '0 4px 6px -1px rgba(20, 23, 19, 0.05), 0 2px 4px -2px rgba(20, 23, 19, 0.05)',
        'elevated': '0 10px 25px -5px rgba(20, 23, 19, 0.08), 0 8px 10px -6px rgba(20, 23, 19, 0.04)',
      }
    },
  },
  plugins: [],
}
