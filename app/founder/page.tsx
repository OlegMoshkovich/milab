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
    title: "Fast approximate nearest-neighbor search with k-nearest neighbor graph",
    meta: "K Hajebi, Y Abbasi-Yadkori, H Shahbazi, H Zhang · IJCAI, 2011",
    cited: "337",
  },
  {
    title:
      "To Believe or Not to Believe Your LLM: Iterative Prompting for Estimating Epistemic Uncertainty",
    meta: "Y Abbasi-Yadkori, I Kuzborskij, A György, C Szepesvári · NeurIPS, 2024",
    cited: "227",
  },
  {
    title:
      "Online-to-Confidence-Set Conversions and Application to Sparse Stochastic Bandits",
    meta: "Y Abbasi-Yadkori, D Pál, C Szepesvári · AISTATS, 2012",
    cited: "225",
  },
  {
    title: "Sharp Convergence Rates for Langevin Dynamics in the Nonconvex Setting",
    meta: "X Cheng, NS Chatterji, Y Abbasi-Yadkori, PL Bartlett, MI Jordan · 2018",
    cited: "218",
  },
];

const SCHOLAR_URL =
  "https://scholar.google.com/citations?user=-D0EgMIAAAAJ&hl=en";

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
          <p className={styles.role}>founder</p>
          <div className={styles.tags}>
            {INTERESTS.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </header>

      <section className={styles.section}>
        <p className={styles.bio}>
          Yasin is a machine learning researcher working on sequential
          decision-making: bandits, reinforcement learning, and online learning.
          His work on linear stochastic bandits and confidence-set methods is
          widely cited, and his recent research looks at estimating uncertainty
          in large language models.
        </p>
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
