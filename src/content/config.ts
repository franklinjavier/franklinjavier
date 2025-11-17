import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
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
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    lang: z.enum(['pt-br', 'en']).default('pt-br'),
  }),
});

export const collections = { blog, pages };
