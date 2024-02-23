import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://github.com/phillip-le/phillip-le",
  integrations: [
    react(),
    tailwind(),
    starlight({
      title: "Developer Setup",
      lastUpdated: true,
    }),
  ],
});
