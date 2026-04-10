/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50:'#eef2ff', 100:'#e0e7ff', 200:'#c7d2fe', 300:'#a5b4fc', 400:'#818cf8', 500:'#6366f1', 600:'#4f46e5', 700:'#4338ca', 800:'#3730a3', 900:'#312e81' },
        success: { 50:'#f0fdf4', 500:'#22c55e', 600:'#16a34a', 700:'#15803d' },
        warning: { 50:'#fffbeb', 500:'#f59e0b', 600:'#d97706' },
        danger:  { 50:'#fef2f2', 500:'#ef4444', 600:'#dc2626' },
      },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'] },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'primary': '0 4px 14px 0 rgb(79 70 229 / 0.3)',
      },
      borderRadius: { 'xl': '0.75rem', '2xl': '1rem', '3xl': '1.5rem' },
    }
  },
  plugins: []
}
