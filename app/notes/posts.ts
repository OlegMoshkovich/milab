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
        body: [
          "A model learns from the world you put it in. That world — what it sees, what counts as success, which mistakes hurt — matters more than almost anything else. And right now, those worlds are mostly built by people who have never done the job the model is supposed to learn.",
          "We think that's backwards. The nurse, the trader, the engineer — the people who actually do the work — should be the ones deciding what good looks like. So that's what we build: training environments owned by the people who know the job.",
        ],
      },
      {
        heading: "Why ownership matters",
        body: [
          "When you've spent years doing something, you notice things nobody else would. The shortcut that looks fine but isn't. The rare case that matters more than a hundred routine ones. If you're the one shaping what the model gets rewarded for, those things get caught early — because you're the person who would have caught them anyway.",
          "There's a longer game here too. An environment that captures how your team thinks becomes something you keep. You can look inside it, change your mind, take it with you. It's yours — not a black box someone rents to you.",
        ],
      },
      {
        heading: "Building the environment",
        body: [
          "We start with real work — actual traces of the job being done — and ask the expert to point at what mattered and why. Those notes become the signal the model learns from. Then we keep the loop tight: adjust, watch what the model does, adjust again.",
          "If any of this feels like writing a spec, we've failed. It should feel like showing a new colleague how you work.",
        ],
      },
      {
        heading: "What's next",
        body: [
          "We're opening this up to more kinds of work and more teams. If you do something worth getting right, we'd love for a model to learn it from you.",
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
      "Some things we keep scribbling in the margins — about rewards, signals, and the questions that won't leave us alone.",
    sections: [
      {
        heading: "Introduction",
        body: [
          "These are notes, not answers. We're sharing them anyway, because the questions have been more useful to us than anything we've concluded so far.",
        ],
      },
      {
        heading: "Signal and reward",
        body: [
          "A reward squeezes everything you care about into one number. Something always gets lost in the squeeze. The craft — and it really is a craft — is choosing what you can afford to lose.",
          "Give a model feedback constantly and it learns fast, but it starts chasing the score instead of the point. Give it feedback rarely and it stays honest, but learning crawls. Most good setups live somewhere in between, and where exactly you land is a real decision, worth arguing about.",
        ],
      },
      {
        heading: "Open questions",
        body: [
          "How do you let someone teach a model things they know but can't quite put into words? How do you keep an environment honest once the model gets clever enough to game it? We don't have tidy answers. Honestly, we're a little suspicious of anyone who says they do.",
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
