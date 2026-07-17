import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./founder.module.css";

export const metadata: Metadata = {
  title: "Yasin Abbasi-Yadkori · Machine Intelligence Research",
  description:
    "Founder of the machine intelligence research lab. Research in AI, machine learning, and reinforcement learning.",
};

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

const RECENT_WORK_URL = "https://arxiv.org/abs/2506.21734";

const BIO_BEFORE = `Yasin has contributed to the advancement of machine intelligence through the foundational work in online reinforcement learning, uncertainty quantification and exploration in Richard Sutton's lab from 2006. His NeurIPS 2011 paper, "Improved Algorithms for Linear Stochastic Bandits," informs much of modern RL exploration. At Google DeepMind he applied UQ research to hallucination detection in large language models. His recent work on hierarchical and recursive architectures led to a `;

const BIO_AFTER = ` and related generation advancements. He founded the machine intelligence research lab to advance collaboration between human and AI through the use of online RL.`;

export default function FounderPage() {
  return (
    <main className={styles.shell}>
      <div className={styles.topbar}>
        <Link href="/" className={styles.wordmark}>
          mi research lab
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
        </div>
      </header>

      <section className={styles.section}>
        <p className={styles.bio}>
          {BIO_BEFORE}
          <a
            className={styles.bioLink}
            href={RECENT_WORK_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Nature-invited paper
          </a>
          {BIO_AFTER}
        </p>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>selected work</h2>
          <a
            className={styles.scholarLink}
            href={SCHOLAR_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Scholar
          </a>
        </div>
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
    </main>
  );
}
