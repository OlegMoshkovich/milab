import Link from "next/link";
import SplitFlap from "./split-flap";

export default function Home() {
  return (
    <main className="home">
      <SplitFlap messages={["machine intelligence"]} />
      <nav className="home-nav">
        <Link href="/notes">notes</Link>
      </nav>
      <nav className="home-team">
        <Link href="/founder">team</Link>
      </nav>
    </main>
  );
}
