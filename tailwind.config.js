/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Helio Offshore inspired dark palette
        offshore: {
          bg: '#0B1220',
          surface: '#121A2B',
          surfaceAlt: '#1A2538',
          border: '#243149',
          accent: '#2DD4BF',
          accentAlt: '#38BDF8',
          warning: '#F59E0B',
          danger: '#F87171',
          text: '#E5EAF2',
          textMuted: '#8B97AC',
        },
      },
    },
  },
  plugins: [],
};
