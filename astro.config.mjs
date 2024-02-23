import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  // Enable React to support React JSX components.
  integrations: [
    react(),
    tailwind(),
    starlight({
      title: "Developer Setup",
      lastUpdated: true,
    }),
  ],
});
