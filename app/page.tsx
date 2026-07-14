import Image from "next/image";
import Link from "next/link";
import SplitFlap from "./split-flap";

export default function Home() {
  return (
    <main className="home">
      <SplitFlap messages={["machine intelligence research"]} />
      <Link href="/notes" className="home-link">
        notes
      </Link>
      <Link href="/founder" className="founder-link" aria-label="Founder">
        <Image
          src="/founder.jpg"
          alt="Founder"
          width={40}
          height={40}
          className="founder-avatar"
        />
      </Link>
    </main>
  );
}
