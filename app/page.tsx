import Link from "next/link";
import SplitFlap from "./split-flap";

export default function Home() {
  return (
    <main className="home">
      <SplitFlap
        messages={[
          "machine intelligence research",
          "crafting expert owned RL environments",
          "personal machine intelligence for all",
        ]}
      />
      <Link href="/blog" className="home-link">
        blog
      </Link>
    </main>
  );
}
