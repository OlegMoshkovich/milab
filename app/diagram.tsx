type Box = {
  cat: string;
  title: string;
  sub?: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

const BOXES: Box[] = [
  { cat: "GROUND TRUTH", title: "Human Expert", x: 340, y: 30, w: 320, h: 100 },
  { cat: "CORE AGENT", title: "Policy Agent", sub: "text responses", x: 30, y: 220, w: 300, h: 100 },
  { cat: "SYNTHETIC ENV", title: "Environment Simulator", sub: "client responses", x: 670, y: 220, w: 300, h: 100 },
  { cat: "AUXILIARY", title: "Critic Agent", sub: "text assessment c", x: 30, y: 430, w: 280, h: 100 },
  { cat: "AUXILIARY", title: "Value Function Q", sub: "scalar score", x: 360, y: 430, w: 280, h: 100 },
  { cat: "AUXILIARY", title: "Uncertainty Estimate", sub: "scalar uncertainty", x: 690, y: 430, w: 280, h: 100 },
];

export default function Diagram() {
  return (
    <div className="diagram">
      <svg
        viewBox="0 0 1000 560"
        style={{ fontFamily: "var(--font)" }}
        role="img"
        aria-label="System architecture: a human expert grounds a policy agent and an environment simulator that exchange episodes, supported by a critic agent, a value function, and an uncertainty estimate."
      >
        <defs>
          <marker id="ah" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
            <path d="M0.5,0.5 L7,3 L0.5,5.5" fill="none" style={{ stroke: "var(--dg-arrow-head)" }} strokeWidth="1.3" />
          </marker>
          <marker id="ahb" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
            <path d="M0.5,0.5 L7,3 L0.5,5.5" fill="none" style={{ stroke: "var(--dg-arrow-head-bright)" }} strokeWidth="1.3" />
          </marker>
        </defs>

        {/* arrows: expert -> others (brighter, dashed) */}
        <line x1="404" y1="130" x2="236" y2="216" style={{ stroke: "var(--dg-arrow-bright)" }} strokeWidth="1.4" strokeDasharray="7 5" markerEnd="url(#ahb)" />
        <line x1="596" y1="130" x2="764" y2="216" style={{ stroke: "var(--dg-arrow-bright)" }} strokeWidth="1.4" strokeDasharray="7 5" markerEnd="url(#ahb)" />
        <line x1="500" y1="130" x2="500" y2="426" style={{ stroke: "var(--dg-arrow-bright)" }} strokeWidth="1.4" strokeDasharray="7 5" markerEnd="url(#ahb)" />

        {/* episodes (solid, double) */}
        <line x1="332" y1="270" x2="668" y2="270" style={{ stroke: "var(--dg-arrow)" }} strokeWidth="1.5" markerStart="url(#ah)" markerEnd="url(#ah)" />

        {/* decisions (double) */}
        <line x1="170" y1="322" x2="170" y2="428" style={{ stroke: "var(--dg-arrow)" }} strokeWidth="1.5" markerStart="url(#ah)" markerEnd="url(#ah)" />

        {/* policy / env -> value function (dashed) */}
        <line x1="300" y1="322" x2="432" y2="427" style={{ stroke: "var(--dg-arrow)" }} strokeWidth="1.3" strokeDasharray="6 5" markerEnd="url(#ah)" />
        <line x1="700" y1="322" x2="568" y2="427" style={{ stroke: "var(--dg-arrow)" }} strokeWidth="1.3" strokeDasharray="6 5" markerEnd="url(#ah)" />

        {/* value function -> uncertainty */}
        <line x1="640" y1="480" x2="688" y2="480" style={{ stroke: "var(--dg-arrow)" }} strokeWidth="1.5" markerEnd="url(#ah)" />

        {/* boxes */}
        {BOXES.map((b) => {
          const cx = b.x + b.w / 2;
          return (
            <g key={b.title}>
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                rx="5"
                fill="none"
                style={{ stroke: "var(--dg-box)" }}
                strokeWidth="1.3"
              />
              <text x={cx} y={b.y + 30} textAnchor="middle" fontSize="11" style={{ fill: "var(--dg-cat)" }} letterSpacing="2">
                {b.cat}
              </text>
              <text x={cx} y={b.y + 60} textAnchor="middle" fontSize="17" style={{ fill: "var(--fg)" }}>
                {b.title}
              </text>
              {b.sub ? (
                <text x={cx} y={b.y + 83} textAnchor="middle" fontSize="13" style={{ fill: "var(--dg-sub)" }}>
                  {b.sub}
                </text>
              ) : null}
            </g>
          );
        })}

        {/* arrow labels */}
        <text x="300" y="160" textAnchor="middle" fontSize="13" style={{ fill: "var(--dg-sub)" }}>f1/f2/f3</text>
        <text x="700" y="160" textAnchor="middle" fontSize="13" style={{ fill: "var(--dg-sub)" }}>e</text>
        <text x="516" y="300" textAnchor="start" fontSize="13" style={{ fill: "var(--dg-sub)" }}>e</text>
        <text x="500" y="258" textAnchor="middle" fontSize="13" style={{ fill: "var(--dg-sub)" }}>episodes</text>
        <text x="152" y="379" textAnchor="end" fontSize="13" style={{ fill: "var(--dg-sub)" }}>decisions</text>
      </svg>
    </div>
  );
}
