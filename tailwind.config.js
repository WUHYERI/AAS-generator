/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // main colors
        accent: '#06b6d4',
        'accent-dark': '#0891b2',

        // hover colors
        'hover-light': '#ecfeff',
        'hover-dark': '#0891b2',

        // system, background
        surface: '#f8fafc',
        subtext: '#64748b',
        line: '#cbd5e1',
        'accent-line': '#22d3ee',
      },
    },
  },
  plugins: [],
};
