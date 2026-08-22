import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    author: z.string().default('Franklin Javier'),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    draft: z.boolean().optional().default(false),
    lang: z.enum(['pt-br', 'en']).default('pt-br'),
    translationKey: z.string().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    lang: z.enum(['pt-br', 'en']).default('pt-br'),
  }),
});

export const collections = { blog, pages };
