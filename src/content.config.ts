import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tech: z.array(z.string()),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    github: z.string().url().optional(),
    live: z.string().url().optional(),
  }),
});

const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({
    role: z.string(),
    org: z.string(),
    start: z.string(),
    end: z.string().default('Present'),
    order: z.number().default(99),
    tech: z.array(z.string()).default([]),
  }),
});

export const collections = { projects, experience };
