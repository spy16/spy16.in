import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    publish: z.boolean().optional(),
    no_toc: z.boolean().optional(),
    series: z.string().optional(),
    part: z.number().optional(),
  }),
});

export const collections = { blog };
