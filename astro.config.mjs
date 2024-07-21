import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

// https://astro.build/config
export default defineConfig({
  site: 'https://phillip-le.github.io',
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    starlight({
      title: 'Developer Musings',
      lastUpdated: true,
      customCss: [
        './src/tailwind.css',
        '@fontsource-variable/jetbrains-mono/index.css',
      ],
      plugins: [starlightLinksValidator()],
    }),
  ],
  vite: {
    optimizeDeps: {
      // fixes error when running `nr start` where `node` for `msw/node` cannot be found with `vite:dep-scan`
      // https://github.com/vitejs/vite/issues/14151
      noDiscovery: true,
    },
  },
});
