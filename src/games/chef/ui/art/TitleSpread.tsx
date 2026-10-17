import { useSvgId } from "../../../../ui/art/useSvgId";
import type { DishId } from "../../content/dish";
import type { PlateColour } from "../../content/plateComponent";
import { dishById, ghostLayout } from "../../core";
import { PlateGroup } from "./PlateArt";

interface SpreadPlate {
  readonly dishId: DishId;
  readonly colour: PlateColour;
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly turn: number;
}

const PLATES: readonly SpreadPlate[] = [
  { dishId: "jollof-rice", colour: "sand", x: 20, y: 40, scale: 0.6, turn: -8 },
  { dishId: "elote", colour: "glaze-blue", x: 330, y: 20, scale: 0.6, turn: 10 },
  { dishId: "spaghetti-al-pomodoro", colour: "white", x: 150, y: 190, scale: 0.75, turn: 0 },
];

const STEAM = [250, 300, 350] as const;

export function TitleSpread({ className }: { readonly className?: string | undefined }) {
  const id = useSvgId("ck-spread");
  return (
    <svg viewBox="0 0 600 520" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-board`} cx="0.45" cy="0.4" r="0.65">
          <stop offset="0" stopColor="#d9a466" />
          <stop offset="0.8" stopColor="#b47a3c" />
          <stop offset="1" stopColor="#8a5a2a" />
        </radialGradient>
        <radialGradient id={`${id}-light`} cx="0.5" cy="0.35" r="0.6">
          <stop offset="0" stopColor="#fff3d6" stopOpacity={0.5} />
          <stop offset="1" stopColor="#fff3d6" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-key`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fffaf0" stopOpacity={0.38} />
          <stop offset="1" stopColor="#fffaf0" stopOpacity={0} />
        </radialGradient>
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={`${id}-wisp`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <pattern id={`${id}-linen`} width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#f4efe4" />
          <path d="M0 5 H16 M0 11 H16" stroke="#3d6fb4" strokeWidth={2.4} opacity={0.5} />
          <path d="M5 0 V16 M11 0 V16" stroke="#3d6fb4" strokeWidth={2.4} opacity={0.35} />
        </pattern>
      </defs>
      <g transform="translate(400 330) rotate(18)">
        <rect x={8} y={10} width={200} height={170} rx={8} fill="#2a1c10" opacity={0.25} />
        <rect width={200} height={170} rx={8} fill={`url(#${id}-linen)`} />
      </g>
      <ellipse cx={312} cy={300} rx={268} ry={212} fill="#2a1c10" opacity={0.3} />
      <ellipse
        cx={300}
        cy={286}
        rx={268}
        ry={212}
        fill={`url(#${id}-board)`}
        stroke="#7a4a22"
        strokeWidth={6}
      />
      {[120, 170, 220].map((rx) => (
        <ellipse
          key={rx}
          cx={300}
          cy={286}
          rx={rx}
          ry={rx * 0.79}
          fill="none"
          stroke="#a8743a"
          strokeWidth={2}
          opacity={0.35}
        />
      ))}
      <ellipse cx={300} cy={286} rx={268} ry={212} fill={`url(#${id}-light)`} />
      {PLATES.map((plate) => (
        <g
          key={plate.dishId}
          transform={`translate(${plate.x} ${plate.y}) rotate(${plate.turn} ${200 * plate.scale} ${200 * plate.scale})`}
        >
          <PlateGroup
            colour={plate.colour}
            components={ghostLayout(dishById(plate.dishId))}
            transform={`scale(${plate.scale})`}
          />
        </g>
      ))}
      {PLATES.map((plate) => (
        <ellipse
          key={`light-${plate.dishId}`}
          cx={plate.x + 200 * plate.scale - 40 * plate.scale}
          cy={plate.y + 200 * plate.scale - 60 * plate.scale}
          rx={120 * plate.scale}
          ry={90 * plate.scale}
          fill={`url(#${id}-key)`}
        />
      ))}
      {STEAM.map((x, index) => (
        <g key={x} className="ck-glory__steam" style={{ animationDelay: `${index * 0.6}s` }}>
          <path
            d={`M${x} 250 c-16 -20 16 -34 0 -56 c-14 -18 14 -32 0 -52`}
            stroke="#ffffff"
            strokeWidth={22}
            strokeLinecap="round"
            fill="none"
            opacity={0.45}
            filter={`url(#${id}-soft)`}
          />
          <path
            d={`M${x} 250 c-16 -20 16 -34 0 -56 c-14 -18 14 -32 0 -52`}
            stroke="#ffffff"
            strokeWidth={5}
            strokeLinecap="round"
            fill="none"
            opacity={0.35}
            filter={`url(#${id}-wisp)`}
          />
        </g>
      ))}
      <g transform="translate(70 420) rotate(-20)">
        <path d="M0 0 C14 -22 40 -26 54 -20 C46 -6 24 6 0 0 Z" fill="#4f8a3c" />
        <path d="M0 0 C24 -10 40 -14 52 -19" stroke="#2f5a22" strokeWidth={1.5} fill="none" />
      </g>
      <g transform="translate(110 446) rotate(30)">
        <path d="M0 0 C12 -18 32 -22 44 -16 C38 -4 20 6 0 0 Z" fill="#6aa84f" />
      </g>
      <g transform="translate(520 120) rotate(-30)">
        <path
          d="M0 0 C10 4 20 12 26 24 C29 30 32 34 34 36 C26 34 16 28 10 20 C5 14 -2 6 0 0 Z"
          fill="#d9472b"
          stroke="#8f2a14"
          strokeWidth={1.5}
        />
        <path d="M0 0 C-3 -4 -6 -6 -8 -6" stroke="#4f8a3c" strokeWidth={3} strokeLinecap="round" />
      </g>
    </svg>
  );
}
