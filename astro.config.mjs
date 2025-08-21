import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import preact from "@astrojs/preact";
import vercel from "@astrojs/vercel";
// https://astro.build/config
export default defineConfig({
  output: "server",

  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark"
      }
    }
  },

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

  integrations: [preact()],
  adapter: vercel()
});