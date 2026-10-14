import { useSvgId } from "../../../../ui/art/useSvgId";
import type { DeliveryScene as SceneId } from "../../content/client";

export interface DeliverySceneProps {
  readonly scene: SceneId;
  readonly className?: string | undefined;
}

function Kitchen() {
  return (
    <g>
      <rect width={800} height={360} fill="#f6e3c3" />
      <rect y={260} width={800} height={100} fill="#c99868" />
      <g fill="#e6cfa8">
        {Array.from({ length: 10 }, (_, index) => (
          <rect
            key={index}
            x={index * 80 + 4}
            y={0}
            width={72}
            height={250}
            opacity={index % 2 === 0 ? 0.5 : 0.25}
          />
        ))}
      </g>
      <rect x={520} y={40} width={200} height={140} rx={8} fill="#bfe0f2" stroke="#7a5236" strokeWidth={8} />
      <path d="M620 40 L620 180 M520 110 L720 110" stroke="#7a5236" strokeWidth={6} />
      <path d="M530 50 Q580 70 600 100" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={6} fill="none" />
      <g transform="translate(110 120)">
        <path d="M0 40 L60 40 L54 100 L6 100 Z" fill="#e8763d" />
        <path d="M30 40 C10 10 0 -10 30 -20 C60 -10 50 10 30 40" fill="#7fa58a" />
      </g>
      <rect x={60} y={240} width={680} height={24} rx={6} fill="#a8724a" />
    </g>
  );
}

function Shop() {
  return (
    <g>
      <rect width={800} height={360} fill="#e9dfcf" />
      <rect y={250} width={800} height={110} fill="#7a5236" />
      <g>
        {[60, 220, 380, 540].map((x) => (
          <g key={x}>
            <rect x={x} y={40} width={140} height={10} fill="#a8724a" />
            <rect x={x} y={110} width={140} height={10} fill="#a8724a" />
            <circle cx={x + 30} cy={30} r={12} fill="#9cb59a" />
            <rect x={x + 70} y={14} width={20} height={26} rx={3} fill="#c47a4a" />
            <circle cx={x + 40} cy={98} r={10} fill="#f2c4c9" />
            <rect x={x + 90} y={84} width={26} height={26} rx={4} fill="#b9a7dc" />
          </g>
        ))}
      </g>
      <rect x={40} y={232} width={720} height={26} rx={6} fill="#553620" />
    </g>
  );
}

function Foyer() {
  return (
    <g>
      <rect width={800} height={360} fill="#4b2a4f" />
      <rect y={260} width={800} height={100} fill="#2f1832" />
      {[80, 260, 440, 620].map((x) => (
        <g key={x}>
          <rect x={x} y={0} width={36} height={260} fill="#6a3d6e" />
          <rect x={x - 6} y={240} width={48} height={20} fill="#7a4c7e" />
        </g>
      ))}
      <path d="M0 0 Q100 80 200 0 Q300 80 400 0 Q500 80 600 0 Q700 80 800 0" fill="#9b1b30" />
      <g fill="#ffd27a" opacity={0.9}>
        {[160, 360, 560, 720].map((x) => (
          <circle key={x} cx={x} cy={60} r={6} />
        ))}
      </g>
      <rect x={60} y={236} width={680} height={26} rx={6} fill="#1f4e5a" />
    </g>
  );
}

function Garden({ id }: { readonly id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-night`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141a3a" />
          <stop offset="1" stopColor="#3b2a5a" />
        </linearGradient>
      </defs>
      <rect width={800} height={360} fill={`url(#${id}-night)`} />
      <path d="M600 60 A40 40 0 1 0 628 128 A30 30 0 1 1 600 60 Z" fill="#fff3d0" />
      <g fill="#fff3d0">
        {[
          [80, 50],
          [180, 110],
          [300, 40],
          [420, 90],
          [520, 30],
          [720, 150],
        ].map(([x, y], index) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={2.4}
            className="jb-twinkle"
            style={{ animationDelay: `${index * 0.5}s` }}
          />
        ))}
      </g>
      <path d="M0 260 Q200 220 400 250 Q600 280 800 240 L800 360 L0 360 Z" fill="#1f3a2e" />
      <g fill="#2d5240">
        <circle cx={90} cy={240} r={40} />
        <circle cx={720} cy={230} r={46} />
      </g>
      <rect x={60} y={236} width={680} height={24} rx={6} fill="#4b2a4f" opacity={0.85} />
    </g>
  );
}

export function DeliveryScene({ scene, className }: DeliverySceneProps) {
  const id = useSvgId("jb-scene");
  return (
    <svg className={className} viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {scene === "kitchen" ? <Kitchen /> : null}
      {scene === "shop" ? <Shop /> : null}
      {scene === "foyer" ? <Foyer /> : null}
      {scene === "garden" ? <Garden id={id} /> : null}
    </svg>
  );
}
