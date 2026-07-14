import Link from "next/link";
import SplitFlap from "./split-flap";

export default function Home() {
  return (
    <main className="home">
      <SplitFlap
        messages={["machine intelligence research"]}
      />
      <Link href="/notes" className="home-link">
        notes
      </Link>
    </main>
  );
}
