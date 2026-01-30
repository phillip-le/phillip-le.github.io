import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import tailwindcss from '@tailwindcss/vite';

import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

// https://astro.build/config
export default defineConfig({
  site: 'https://phillip-le.github.io',
  integrations: [
    react(),
    starlight({
      title: 'Developer Musings',
      lastUpdated: true,
      customCss: [
        './src/tailwind.css',
        '@fontsource-variable/jetbrains-mono/index.css'
      ],
      plugins: [starlightLinksValidator()],
    }),
  ],
  markdown: {
    rehypePlugins: [
      rehypeHeadingIds,
      rehypeAutolinkHeadings,
    ],
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      // fixes error when running `nr start` where `node` for `msw/node` cannot be found with `vite:dep-scan`
      // https://github.com/vitejs/vite/issues/14151
      noDiscovery: true,
    },
  },
});
