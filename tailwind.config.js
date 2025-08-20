/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';
import animate from 'tailwindcss-animate';

export default {
  content: ['src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      screens: {
        custom: '868px',
      },
    },
  },
  plugins: [animate, typography],
};
