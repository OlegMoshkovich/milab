import Diagram from "./diagram";
import SplitFlap from "./split-flap";

const DESC = `We believe in the world where machine intelligence is distributed, trained, monetized and supervised by experts, and where agents improve on demand by interacting with purposely built environments.`;

export default function Home() {
  return (
    <main className="home">
      <nav className="home-nav">
        <SplitFlap landing="machine intelligence research" idle="mi research lab" />
      </nav>
      <div className="home-content">
        <p className="home-desc">{DESC}</p>
      </div>
      <Diagram />
    </main>
  );
}
