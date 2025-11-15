// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://franklinjavier.com',
  output: 'static',
  build: {
    format: 'directory', // Creates /posts/title/index.html
  },
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'vesper',
      defaultColor: false,
    },
  },
  integrations: [
    tailwind(),
  ],
});
