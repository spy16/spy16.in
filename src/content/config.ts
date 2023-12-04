import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		tags: z.array(z.string()).optional(),
		publish: z.boolean().optional(),
		no_toc: z.boolean().optional(),
	}),
});

export const collections = { blog };
