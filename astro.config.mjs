import { defineConfig, passthroughImageService } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://spy16.in",
  prefetch: true,
  integrations: [mdx(), sitemap()],
  image: {
    service: passthroughImageService(),
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    gfm: true,
    smartypants: true,
    shikiConfig: {
      wrap: false,
      theme: "vesper",
    },
  },
});
