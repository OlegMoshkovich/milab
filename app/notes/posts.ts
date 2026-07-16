export type Section = { heading: string; body: string[] };

export type Post = {
  slug: string;
  title: string;
  date: string; // display date, e.g. "Jul 2, 2026"
  iso: string; // sortable date, e.g. "2026-07-02"
  author: string;
  excerpt: string;
  sections: Section[];
};

export const posts: Post[] = [
  {
    slug: "crafting-expert-owned-rl-environments",
    title: "Crafting Expert-Owned RL Environments",
    date: "Jul 2, 2026",
    iso: "2026-07-02",
    author: "Machine Intelligence Research",
    excerpt:
      "A model learns from the world you put it in. We think the people who actually do the work should be the ones building that world.",
    sections: [
      {
        heading: "Introduction",
        body: [],
      },
      {
        heading: "Why ownership matters",
        body: [],
      },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export const sortedPosts = [...posts].sort((a, b) =>
  a.iso < b.iso ? 1 : a.iso > b.iso ? -1 : 0,
);
