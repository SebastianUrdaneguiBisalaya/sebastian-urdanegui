import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import preact from "@astrojs/preact";
import vercel from "@astrojs/vercel";
import rehypePrettyCode from "rehype-pretty-code";
import remarkCallouts from "remark-callouts";

export default defineConfig({
  output: "server",

  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: {
            light: "one-light",
            dark: "material-theme-darker",
          },
          keepBackground: true,
        },
      ],
    ],
    remarkPlugins: [remarkCallouts],
  },

  vite: {
    plugins: [tailwindcss()],
  },

  i18n: {
    locales: ["en", "es"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [preact()],
  adapter: vercel(),
});
