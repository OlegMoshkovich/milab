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
      "Reinforcement learning is only as good as the world it learns in. We think experts should own that world.",
    sections: [
      {
        heading: "Introduction",
        body: [
          "Reinforcement learning is only as good as the environment it learns in. The reward function, the observations, the edge cases — these are the real curriculum, and today they are mostly written by people far removed from the work being modeled.",
          "We build environments that the domain experts themselves own and shape: the clinician, the trader, the engineer. The people who understand the task define what good looks like.",
        ],
      },
      {
        heading: "Why ownership matters",
        body: [
          "When an environment is owned by its experts, the reward stops being a proxy and starts being a contract. Mistakes surface early, because the person who would catch them in the real world is the same person tuning the signal.",
          "Ownership also travels. An environment that captures one team's judgment becomes an asset they can version, audit, and carry with them — not a black box they rent.",
        ],
      },
      {
        heading: "Building the environment",
        body: [
          "We start from traces of real work and let experts annotate what mattered and why. Those annotations become the shaping signal. The loop is deliberately short: change the reward, watch the policy, correct.",
          "The tooling stays out of the way. If defining an environment feels like writing a spec, we have failed; it should feel like showing someone how you work.",
        ],
      },
      {
        heading: "What's next",
        body: [
          "We are opening this process to more domains and more teams. If you own a task worth getting right, we want the model to learn it from you.",
        ],
      },
    ],
  },
  {
    slug: "notes-on-reinforcement-environments",
    title: "Notes on Reinforcement Environments",
    date: "Mar 8, 2026",
    iso: "2026-03-08",
    author: "Machine Intelligence Research",
    excerpt:
      "A few working notes on reward design, signal, and the questions we keep returning to.",
    sections: [
      {
        heading: "Introduction",
        body: [
          "These are working notes, not conclusions. We keep them public because the questions are more useful than our current answers.",
        ],
      },
      {
        heading: "Signal and reward",
        body: [
          "A reward is a compression of everything you care about into a single number. Every compression loses something; the craft is choosing what to lose.",
          "Dense signal trains faster but overfits to the metric. Sparse signal is honest but slow. Most good environments interpolate, and the interpolation is itself a design decision worth taking seriously.",
        ],
      },
      {
        heading: "Open questions",
        body: [
          "How do we let experts express preferences that they cannot fully articulate? How do we keep an environment honest as the policy learns to exploit it? We do not have clean answers, and we are wary of anyone who claims to.",
        ],
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
