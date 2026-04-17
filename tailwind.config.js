/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        'primary-dark': '#5B21B6',
        secondary: '#F59E0B',
        surface: '#F9FAFB',
        muted: '#6B7280',
      },
    },
  },
  plugins: [],
};
