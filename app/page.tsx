import Link from "next/link";
import Diagram from "./diagram";
import SplitFlap from "./split-flap";

const DESC = `We craft expert-owned RL environments: high-fidelity artifacts built and owned by the domain experts whose judgment they encode. We believe in the world where machine intelligence is distributed and where dynamics are created that allow the agents to be improved, monetized and supervised by domain experts.`;

export default function Home() {
  return (
    <main className="home">
      <nav className="home-nav">
        <SplitFlap messages={["machine intelligence research"]} />
        <Link href="/notes">notes</Link>
      </nav>
      <div className="home-content">
        <p className="home-desc">{DESC}</p>
      </div>
      <Diagram />
      <nav className="home-team">
        <Link href="/founder">team</Link>
      </nav>
    </main>
  );
}
