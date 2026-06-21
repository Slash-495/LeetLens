/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F17',
        surface: '#111827',
        accent: '#6366F1',
        text: '#F9FAFB',
        muted: '#9CA3AF',
        border: '#1F2937'
      },
      borderRadius: {
        'xl': '12px',
        DEFAULT: '12px',
        'md': '12px',
        'lg': '12px'
      }
    },
  },
  plugins: [],
}
