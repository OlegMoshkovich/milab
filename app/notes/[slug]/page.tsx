import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../notes.module.css";
import { getPost, posts } from "../posts";

const anchor = (heading: string) =>
  heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: `${post.title} — Machine Intelligence Research`,
    description: post.excerpt,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

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

      <article>
        <div className={styles.body}>
          <h1 className={styles.articleTitle}>{post.title}</h1>
          <p className={styles.meta}>{post.date}</p>

          {post.sections.map((s) => (
            <section key={s.heading} id={anchor(s.heading)} className={styles.section}>
              <h2 className={styles.h2}>{s.heading}</h2>
              {s.body.map((para, i) => (
                <p key={i} className={styles.p}>
                  {para}
                </p>
              ))}
            </section>
          ))}

          <div className={styles.backRow}>
            <Link href="/notes" className={styles.back}>
              ← all posts
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
