import SplitFlap from "./split-flap";

export default function Home() {
  return (
    <main className="home">
      <SplitFlap
        messages={[
          "machine intelligence research lab",
          "crafting RL expert environments",
        ]}
      />
    </main>
  );
}
