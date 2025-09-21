import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/data/blog",
  }),
  schema: z.object({
    author: z.string(),
    publishDate: z.string(),
    views: z.number(),
    comments: z.number(),
  }),
});

export const collections = {
  blog,
};
