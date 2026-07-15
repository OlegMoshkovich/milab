import Link from "next/link";
import SplitFlap from "./split-flap";

export default function Home() {
  return (
    <main className="home">
      <SplitFlap messages={["machine intelligence research"]} />
      <nav className="home-nav">
        <Link href="/founder">team</Link>
        <Link href="/notes">notes</Link>
      </nav>
    </main>
  );
}
