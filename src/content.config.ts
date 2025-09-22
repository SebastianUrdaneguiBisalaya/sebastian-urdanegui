import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const englishBlog = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/data/en/blog",
  }),
  schema: z.object({
    author: z.string(),
    publishDate: z.string(),
    views: z.number(),
    comments: z.number(),
  }),
});

const spanishBlog = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/data/es/blog",
  }),
  schema: z.object({
    author: z.string(),
    publishDate: z.string(),
    views: z.number(),
    comments: z.number(),
  }),
});

export const collections = {
  englishBlog,
  spanishBlog,
};
