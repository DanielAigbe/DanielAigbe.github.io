import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Each case study is one Markdown file in src/content/work/.
// To add a project, copy an existing file and change the details at the top.
const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),                 // position on the site (1 = first)
    featured: z.boolean().default(false), // show on the homepage
    summary: z.string(),               // short text for the homepage row and work card
    intro: z.string(),                 // longer text under the case study title
    tags: z.array(z.string()),
    role: z.string(),
    client: z.string(),
    year: z.string(),
    tools: z.string(),
    status: z.string().optional(),     // e.g. "In progress"
    cover: z.object({
      kind: z.string().default('placeholder'),
      image: z.string().optional(),
      label: z.string().optional(),
      alt: z.string().optional(),
      url: z.string().optional(),
      video: z.string().optional(),   // e.g. /videos/odara (serves .webm and .mp4)
      poster: z.string().optional(),
    }),
    draft: z.boolean().default(false), // true = card only, no case study page yet
  }),
});

export const collections = { work };
