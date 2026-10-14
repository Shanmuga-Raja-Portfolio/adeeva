import type { ReactNode } from "react";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { DeliveryScene as SceneId } from "../../content/client";

interface DeliverySceneProps {
  readonly scene: SceneId;
  readonly children?: ReactNode;
  readonly className?: string | undefined;
  readonly label: string;
}

const OUTLINE = "#2f2622";

function Garden({ id }: { id: string }) {
  return (
    <g>
      <rect width={800} height={520} fill={`url(#${id}-sky)`} />
      <circle cx={680} cy={90} r={44} fill="#fff3b0" />
      <g fill="#ffffff" opacity={0.9}>
        <ellipse cx={180} cy={90} rx={60} ry={20} />
        <ellipse cx={220} cy={78} rx={40} ry={18} />
      </g>
      <g stroke={OUTLINE} strokeWidth={3}>
        {Array.from({ length: 12 }, (_, index) => (
          <path key={index} d={`M${index * 70 + 10} 330 V230 l18 -18 l18 18 V330 Z`} fill="#f6efe0" />
        ))}
        <rect x={0} y={250} width={800} height={14} fill="#e9dfcb" />
        <rect x={0} y={300} width={800} height={14} fill="#e9dfcb" />
      </g>
      <rect x={0} y={330} width={800} height={190} fill="#8cbf7a" />
      <path d="M0 360 Q200 340 400 362 T800 352 V520 H0 Z" fill="#7bb36a" />
      <g stroke={OUTLINE} strokeWidth={2.5}>
        <rect x={84} y={190} width={22} height={160} fill="#7a5233" />
        <circle cx={96} cy={170} r={70} fill="#4f8a5b" />
        <circle cx={60} cy={210} r={40} fill="#5f9b66" />
        <circle cx={70} cy={150} r={8} fill="#e05a47" />
        <circle cx={120} cy={186} r={8} fill="#e05a47" />
      </g>
      <g stroke={OUTLINE} strokeWidth={2}>
        {[620, 660, 700, 740].map((x, index) => (
          <g key={x}>
            <line x1={x} y1={420} x2={x} y2={380} stroke="#3f6b4f" strokeWidth={3} />
            <circle cx={x} cy={374} r={10} fill={["#f2c4c9", "#f2c230", "#b9a7dc", "#f07f63"][index]} />
            <circle cx={x} cy={374} r={3.5} fill="#fff3b0" />
          </g>
        ))}
      </g>
    </g>
  );
}

function Bedroom() {
  return (
    <g>
      <rect width={800} height={420} fill="#dfe7ee" />
      {Array.from({ length: 20 }, (_, index) => (
        <rect key={index} x={index * 40} y={0} width={18} height={420} fill="#c9d6e2" opacity={0.6} />
      ))}
      <g stroke={OUTLINE} strokeWidth={4}>
        <rect x={560} y={70} width={170} height={150} rx={6} fill="#9fd0ee" />
        <path d="M645 70 V220 M560 145 H730" />
        <path d="M548 64 Q560 150 548 236 L572 236 Q588 150 572 64 Z" fill="#f2c4c9" strokeWidth={3} />
        <path d="M742 64 Q730 150 742 236 L718 236 Q702 150 718 64 Z" fill="#f2c4c9" strokeWidth={3} />
      </g>
      <rect x={0} y={420} width={800} height={100} fill="#c8a67e" />
      <path d="M0 420 H800" stroke={OUTLINE} strokeWidth={3} />
      <ellipse
        cx={400}
        cy={470}
        rx={260}
        ry={34}
        fill="#f2c230"
        opacity={0.5}
        stroke={OUTLINE}
        strokeWidth={2}
      />
      <g stroke={OUTLINE} strokeWidth={3}>
        <rect x={20} y={300} width={130} height={130} rx={10} fill="#4a6378" />
        <rect x={30} y={270} width={110} height={44} rx={14} fill="#fffaf1" />
        <rect x={20} y={340} width={130} height={30} fill="#f07f63" />
      </g>
      <g stroke={OUTLINE} strokeWidth={2}>
        <circle cx={200} cy={110} r={22} fill="#fff3b0" />
        <path d="M188 112 l6 6 l12 -12" stroke="#3f6b4f" strokeWidth={3} fill="none" />
      </g>
    </g>
  );
}

function Cafe() {
  return (
    <g>
      <rect width={800} height={420} fill="#f6e2c4" />
      <g stroke={OUTLINE} strokeWidth={4}>
        <rect x={60} y={60} width={300} height={200} rx={8} fill="#9fd0ee" />
        <path d="M210 60 V260" />
        <path d="M44 52 H376 L360 92 H60 Z" fill="#d0587e" />
        <path
          d="M60 92 l30 -40 M120 92 l30 -40 M180 92 l30 -40 M240 92 l30 -40 M300 92 l30 -40"
          stroke="#fff"
          strokeWidth={6}
        />
      </g>
      <g stroke={OUTLINE} strokeWidth={3}>
        <rect x={470} y={60} width={250} height={160} rx={6} fill="#2f3a33" />
        <text
          x={595}
          y={110}
          textAnchor="middle"
          fill="#fff6de"
          fontSize={26}
          fontFamily='"Rockwell", "Roboto Slab", Georgia, serif'
          stroke="none"
        >
          Corner Cup
        </text>
        <path d="M520 140 H670 M520 170 H640" stroke="#fff6de" strokeWidth={3} strokeDasharray="10 6" />
      </g>
      <rect x={0} y={420} width={800} height={100} fill="#b97f43" />
      <g opacity={0.5}>
        {Array.from({ length: 10 }, (_, index) => (
          <path key={index} d={`M${index * 90} 420 l40 100`} stroke="#8f5a26" strokeWidth={3} />
        ))}
      </g>
      <path d="M0 420 H800" stroke={OUTLINE} strokeWidth={3} />
      <g stroke={OUTLINE} strokeWidth={2.5}>
        <path d="M640 300 h40 v30 a20 20 0 0 1 -40 0 Z" fill="#fffaf1" />
        <path d="M680 306 a10 10 0 0 1 0 18" fill="none" />
        <path d="M652 292 q4 -10 0 -18 M666 292 q4 -10 0 -18" fill="none" stroke="#9aa4ad" />
      </g>
    </g>
  );
}

function Library() {
  const colours = ["#d0587e", "#4a6378", "#f2c230", "#3f6b4f", "#9fd0ee", "#f07f63", "#b9a7dc", "#c58a4a"];
  return (
    <g>
      <rect width={800} height={420} fill="#efe1c8" />
      <g stroke={OUTLINE} strokeWidth={3}>
        {[0, 1].map((side) => (
          <g key={side} transform={`translate(${side === 0 ? 30 : 590} 50)`}>
            <rect width={180} height={360} fill="#8f5a26" />
            {[0, 1, 2, 3].map((row) => (
              <g key={row}>
                <rect x={10} y={10 + row * 88} width={160} height={78} fill="#5e3a1d" />
                {Array.from({ length: 9 }, (_, index) => (
                  <rect
                    key={index}
                    x={14 + index * 17}
                    y={24 + row * 88 + (index % 3) * 4}
                    width={14}
                    height={64 - (index % 3) * 4}
                    fill={colours[(index + row + side) % colours.length]}
                    strokeWidth={1.5}
                  />
                ))}
              </g>
            ))}
          </g>
        ))}
      </g>
      <rect x={0} y={420} width={800} height={100} fill="#a8703e" />
      <path d="M0 420 H800" stroke={OUTLINE} strokeWidth={3} />
      <ellipse
        cx={400}
        cy={470}
        rx={240}
        ry={32}
        fill="#4a8a94"
        opacity={0.6}
        stroke={OUTLINE}
        strokeWidth={2}
      />
      <g stroke={OUTLINE} strokeWidth={2.5}>
        <line x1={400} y1={0} x2={400} y2={50} />
        <path d="M370 80 Q400 40 430 80 Z" fill="#3f6b4f" />
        <circle cx={400} cy={84} r={8} fill="#fff3b0" />
      </g>
    </g>
  );
}

export function DeliveryScene({ scene, children, className, label }: DeliverySceneProps) {
  const id = useSvgId("ww-scene");
  return (
    <svg className={className} viewBox="0 0 800 520" role="img" aria-label={label}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fd0ee" />
          <stop offset="1" stopColor="#e9f6ff" />
        </linearGradient>
      </defs>
      {scene === "garden" ? <Garden id={id} /> : null}
      {scene === "bedroom" ? <Bedroom /> : null}
      {scene === "cafe" ? <Cafe /> : null}
      {scene === "library" ? <Library /> : null}
      {children}
    </svg>
  );
}
