import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Set `site` to your real domain before deploying (used for canonical URLs).
export default defineConfig({
  site: 'https://danielaigbe.github.io',
  integrations: [react()],
});
