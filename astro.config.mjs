import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";

// https://astro.build/config
export default defineConfig({
  site: "https://phillip-le.github.io",
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    starlight({
      title: "Developer Musings",
      lastUpdated: true,
      customCss: [
        "./src/tailwind.css",
        "@fontsource-variable/jetbrains-mono/index.css",
      ],
      plugins: [starlightLinksValidator()]
    }),
  ],
});
