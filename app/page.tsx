import Link from "next/link";
import SplitFlap from "./split-flap";

const DESC = `We craft expert-owned RL environments: high-fidelity training gyms where AI agents learn to do real economic work, built and owned by the domain experts whose judgment they encode. We believe the next generation of AI capability won't come from scaling models; it will come from scaling the quality of what they train in. Through research and product co-design, where deployment grounds our research in reality. Our long-term aim is a library of expert-owned environments spanning the economy's most valuable work across medicine, law and finance.`;

export default function Home() {
  return (
    <main className="home">
      <div className="home-content">
        <SplitFlap messages={["machine intelligence research"]} />
        <p className="home-desc">{DESC}</p>
      </div>
      <nav className="home-nav">
        <Link href="/" className="home-wordmark">
          mi research lab
        </Link>
        <Link href="/notes">notes</Link>
      </nav>
      <nav className="home-team">
        <Link href="/founder">team</Link>
      </nav>
    </main>
  );
}
