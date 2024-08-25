import starlightPlugin from '@astrojs/starlight-tailwind';
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono Variable"', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [starlightPlugin()],
};
