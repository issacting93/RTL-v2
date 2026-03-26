/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../ui/src/**/*.{js,ts,jsx,tsx}",
    "../viz/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bloom: {
          bg: 'var(--bloom-bg)',
          'bg-subtle': 'var(--bloom-bg-subtle)',
          black: 'var(--bloom-black)',
          gray: 'var(--bloom-gray)',
          'gray-dark': 'var(--bloom-gray-dark)',
          yellow: 'var(--bloom-yellow)',
          orange: 'var(--bloom-orange)',
          green: 'var(--bloom-green)',
          purple: 'var(--bloom-purple)',
          text: 'var(--bloom-text)',
          'text-dim': 'var(--bloom-text-dim)',
        },
      },
      boxShadow: {
        'bloom-sm': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'bloom-md': '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
