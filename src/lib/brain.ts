import { getCollection, type CollectionEntry } from "astro:content";

import type { Lobe } from "../consts";

const TAG_ALIASES: Record<string, string> = {
  golang: "go",
  perf: "performance",
  optimization: "performance",
  distributed_system: "distributed-systems",
  genai: "llm",
  chatgpt: "llm",
  ai: "llm",
};

export type Post = CollectionEntry<"blog">;

export type BrainPost = {
  id: string;
  title: string;
  lobe: Lobe;
  date: string;
  url: string;
};

export type Brain = {
  posts: BrainPost[];
  concepts: { name: string; posts: number[] }[];
};

export const lobeOf = (p: Post) => p.id.split("/")[0] as Lobe;

export const urlOf = (p: Post) => `/posts/${p.id}/`;

export const readingMinutes = (p: Post) => Math.max(1, Math.round((p.body ?? "").split(/\s+/).length / 230));

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", (p) => !import.meta.env.PROD || !!p.data.publish);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function conceptsOf(p: Post): string[] {
  const tags = (p.data.tags ?? []).map((t) => {
    const k = t.toLowerCase();
    return TAG_ALIASES[k] ?? k;
  });
  return [...new Set(tags)].filter((t) => t !== lobeOf(p));
}

export async function getBrain(): Promise<Brain> {
  const posts = await getPosts();
  const byConcept = new Map<string, number[]>();
  posts.forEach((p, i) => conceptsOf(p).forEach((c) => byConcept.set(c, [...(byConcept.get(c) ?? []), i])));
  return {
    posts: posts.map((p) => ({
      id: p.id,
      title: p.data.title,
      lobe: lobeOf(p),
      date: p.data.pubDate.toISOString().slice(0, 10),
      url: urlOf(p),
    })),
    concepts: [...byConcept].filter(([, ids]) => ids.length > 1).map(([name, ids]) => ({ name, posts: ids })),
  };
}

export async function getSeries(name: string): Promise<Post[]> {
  return (await getPosts()).filter((p) => p.data.series === name).sort((a, b) => (a.data.part ?? 0) - (b.data.part ?? 0));
}

export async function getRelated(post: Post, n = 3): Promise<Post[]> {
  const mine = new Set(conceptsOf(post));
  const t = post.data.pubDate.valueOf();
  return (await getPosts())
    .filter((p) => p.id !== post.id)
    .map((p) => ({
      p,
      score:
        conceptsOf(p).filter((c) => mine.has(c)).length * 10 +
        (lobeOf(p) === lobeOf(post) ? 5 : 0) -
        Math.abs(p.data.pubDate.valueOf() - t) / 3.15e10,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.p);
}
