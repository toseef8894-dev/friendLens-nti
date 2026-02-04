/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'brand-blue': '#4F46E5',
        'brand-purple': '#8B5CF6',
        'text-primary': '#0F172B',
        'text-secondary': '#62748E',
        'text-muted': '#9CA3AF',
        'bg-muted': '#F3F4F6',
        'border-light': '#E5E7EB',
      },
    }
  },
  plugins: []
};
