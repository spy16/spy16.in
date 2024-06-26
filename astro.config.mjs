import { defineConfig, passthroughImageService } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import Icons from 'unplugin-icons/vite';
import tailwind from "@astrojs/tailwind";
import prefetch from "@astrojs/prefetch";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: 'https://spy16.in',
  prefetch: true,
  integrations: [mdx(), sitemap(), tailwind(), prefetch()],
  image: {
    service: passthroughImageService()
  },
  vite: {
    plugins: [Icons({
      compiler: 'astro',
      autoInstall: true
    })]
  },
  markdown: {
    gfm: true,
    smartypants: true,
    shikiConfig: {
      wrap: false,
      theme: "rose-pine-dawn"
    }
  },
  output: "hybrid",
  adapter: cloudflare()
});