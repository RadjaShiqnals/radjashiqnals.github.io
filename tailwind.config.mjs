/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'kita-red': '#cc5245',
        'kita-red-dark': '#943834',
        'kita-shirt': '#363636ff',
      },
    },
  },
  plugins: [],
};
