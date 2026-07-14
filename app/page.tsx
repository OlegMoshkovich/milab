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
    </main>
  );
}
