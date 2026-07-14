import type { Metadata } from "next";
import Link from "next/link";
import styles from "./blog.module.css";
import { sortedPosts } from "./posts";

export const metadata: Metadata = {
  title: "Blog — Machine Intelligence Research",
  description: "Notes from the machine intelligence research lab.",
};

export default function BlogIndex() {
  return (
    <main className={styles.shell}>
      <div className={styles.topbar}>
        <Link href="/" className={styles.wordmark}>
          machine intelligence
        </Link>
        <nav className={styles.nav}>
          <Link href="/">home</Link>
        </nav>
      </div>

      <header className={styles.lead}>
        <h1 className={styles.h1}>blog</h1>
      </header>

      <div className={styles.list}>
        {sortedPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.row}>
            <time className={styles.date} dateTime={post.iso}>
              {post.date}
            </time>
            <div>
              <div className={styles.rowTitle}>{post.title}</div>
              <div className={styles.rowBy}>{post.author}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
