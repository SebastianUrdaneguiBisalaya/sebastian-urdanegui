import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import preact from "@astrojs/preact";
// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  i18n: {
    locales:["en", "es"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    }
  },

  integrations: [preact()]
});