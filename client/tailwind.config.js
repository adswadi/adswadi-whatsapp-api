/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#7B2FBE',
          blue: '#4A6CF7',
          pink: '#E91E8C',
          magenta: '#C2185B',
        },
        sidebar: {
          bg: '#1A0A2E',
          accent: '#7B2FBE',
          text: '#E8D5F5',
        },
        whatsapp: '#25D366',
      },
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        dm: ['"DM Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #E8D5F5 0%, #D4E4FF 50%, #F5D0E8 100%)',
        'gradient-brand': 'linear-gradient(90deg, #7B2FBE, #4A6CF7, #E91E8C)',
      },
    },
  },
  plugins: [],
}
