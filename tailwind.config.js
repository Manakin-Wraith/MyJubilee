// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'confetti-gradient': 'linear-gradient(135deg, #00FFFC, #FC00FF, #fffc00)',
      },
    },
  },
  plugins: [],
};