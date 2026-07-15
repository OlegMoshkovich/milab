import Link from "next/link";
import SplitFlap from "./split-flap";

export default function Home() {
  return (
    <main className="home">
      <SplitFlap messages={["machine intelligence research"]} />
      <nav className="home-nav">
        <Link href="/notes">notes</Link>
      </nav>
      <Link href="/founder" className="team-link">
        team
      </Link>
    </main>
  );
}
