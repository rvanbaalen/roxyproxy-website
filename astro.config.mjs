import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import posthog from "astro-posthog";
import pagefind from "astro-pagefind";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://laurelproxy.robinvanbaalen.nl",

  integrations: [
    react(),
    ...(process.env.PUBLIC_POSTHOG_KEY
      ? [posthog({ posthogKey: process.env.PUBLIC_POSTHOG_KEY })]
      : []),
    pagefind(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: process.argv.includes("dev") ? undefined : cloudflare(),
});