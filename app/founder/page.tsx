import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./founder.module.css";

export const metadata: Metadata = {
  title: "Yasin Abbasi-Yadkori · Machine Intelligence Research",
  description:
    "Founder of the machine intelligence research lab. Research in AI, machine learning, and reinforcement learning.",
};

const INTERESTS = [
  "Artificial Intelligence",
  "Machine Learning",
  "Reinforcement Learning",
];

const PUBLICATIONS = [
  {
    title: "Improved algorithms for linear stochastic bandits",
    meta: "Y Abbasi-Yadkori, C Szepesvári, D Pál · NeurIPS, 2011",
    cited: "2781",
  },
  {
    title: "Regret Bounds for the Adaptive Control of Linear Quadratic Systems",
    meta: "Y Abbasi-Yadkori, C Szepesvári · COLT, 2011",
    cited: "537",
  },
  {
    title:
      "To Believe or Not to Believe Your LLM: Iterative Prompting for Estimating Epistemic Uncertainty",
    meta: "Y Abbasi-Yadkori, I Kuzborskij, A György, C Szepesvári · NeurIPS, 2024",
    cited: "227",
  },
];

const SCHOLAR_URL =
  "https://scholar.google.com/citations?user=-D0EgMIAAAAJ&hl=en";

const BIO = `Foundational work in online reinforcement learning, uncertainty quantification, and exploration in Richard Sutton's lab from 2006. His NeurIPS 2011 paper, "Improved Algorithms for Linear Stochastic Bandits," has about 2,635 citations and informs much of modern RL exploration. At Google DeepMind he applied UQ research to hallucination detection in large language models. In 2022, research on hierarchical and recursive architectures at an AI start-up led to a Nature-invited paper and related generation work. He founded the machine intelligence research lab to advance human-in-the-loop online RL: agents that explore efficiently and learn directly from human teachers. H-index 33.`;

export default function FounderPage() {
  return (
    <main className={styles.shell}>
      <div className={styles.topbar}>
        <Link href="/" className={styles.wordmark}>
          machine intelligence
        </Link>
        <nav className={styles.nav}>
          <Link href="/notes">notes</Link>
          <Link href="/">home</Link>
        </nav>
      </div>

      <header className={styles.header}>
        <Image
          src="/founder.jpg"
          alt="Yasin Abbasi-Yadkori"
          width={128}
          height={128}
          className={styles.photo}
          priority
        />
        <div>
          <h1 className={styles.name}>Yasin Abbasi-Yadkori</h1>
          <p className={styles.role}>senior researcher</p>
          <div className={styles.tags}>
            {INTERESTS.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </header>

      <section className={styles.section}>
        <p className={styles.bio}>{BIO}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>selected work</h2>
        <div className={styles.list}>
          {PUBLICATIONS.map((p) => (
            <div key={p.title} className={styles.pub}>
              <div>
                <a
                  className={styles.pubTitle}
                  href={`https://scholar.google.com/scholar?q=${encodeURIComponent(
                    p.title,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {p.title}
                </a>
                <div className={styles.pubMeta}>{p.meta}</div>
              </div>
              <div className={styles.cited}>{p.cited} cited</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.links}>
          <a href={SCHOLAR_URL} target="_blank" rel="noopener noreferrer">
            Google Scholar
          </a>
        </div>
      </section>
    </main>
  );
}
