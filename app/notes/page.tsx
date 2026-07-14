import type { Metadata } from "next";
import Link from "next/link";
import styles from "./notes.module.css";
import { sortedPosts } from "./posts";

export const metadata: Metadata = {
  title: "Notes — Machine Intelligence Research",
  description: "Notes from the machine intelligence research lab.",
};

export default function NotesIndex() {
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
        <h1 className={styles.h1}>notes</h1>
      </header>

      <div className={styles.list}>
        {sortedPosts.map((post) => (
          <Link key={post.slug} href={`/notes/${post.slug}`} className={styles.row}>
            <time className={styles.date} dateTime={post.iso}>
              {post.date}
            </time>
            <div className={styles.rowTitle}>{post.title}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
