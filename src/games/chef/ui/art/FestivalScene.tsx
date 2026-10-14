import { useSvgId } from "../../../../ui/art/useSvgId";
import { ClementineArt } from "./ClementineArt";

export interface FestivalSceneProps {
  readonly sky: string;
  readonly flag: string;
  readonly menu: readonly string[];
  readonly ribbons: number;
}

const BUNTING = ["#d9472b", "#f2a93b", "#4f8a3c", "#3d84d6", "#e0708f", "#f3f0e8"];

export function FestivalScene({ sky, flag, menu, ribbons }: FestivalSceneProps) {
  const glow = useSvgId("ck-festival-glow");
  return (
    <g>
      <defs>
        <linearGradient id={glow} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky} />
          <stop offset="1" stopColor="#ffe2a8" />
        </linearGradient>
      </defs>
      <rect width={1200} height={600} fill={`url(#${glow})`} />
      <circle cx={980} cy={120} r={60} fill="#fff4d6" opacity={0.8} />
      <path d="M0 330 Q200 270 420 320 T840 300 T1200 310 V600 H0 Z" fill="#8fbf6a" />
      <path d="M0 380 Q300 340 600 380 T1200 370 V600 H0 Z" fill="#78ab55" />
      {[90, 230, 1010, 1120].map((x, index) => (
        <g key={`tent-${x}`}>
          <path
            d={`M${x - 70} 360 L${x} ${280 - index * 6} L${x + 70} 360 Z`}
            fill={index % 2 === 0 ? "#f3f0e8" : flag}
          />
          <path d={`M${x - 70} 360 L${x} ${280 - index * 6} L${x - 20} 360 Z`} fill="#000" opacity={0.08} />
          <path d={`M${x} ${280 - index * 6} V${262 - index * 6}`} stroke="#5a3420" strokeWidth={3} />
          <path d={`M${x} ${262 - index * 6} l18 6 l-18 6 Z`} fill={flag} />
        </g>
      ))}
      <path d="M0 70 Q300 150 600 80 T1200 90" fill="none" stroke="#5a3420" strokeWidth={2} />
      {Array.from({ length: 24 }, (_, index) => {
        const x = 20 + index * 50;
        const y =
          76 + Math.sin((index / 24) * Math.PI * 4) * 30 + (index < 12 ? index * 2 : (24 - index) * 2);
        return (
          <path
            key={`flag-${index}`}
            d={`M${x - 14} ${y} h28 l-14 22 Z`}
            fill={BUNTING[index % BUNTING.length]}
            className="ck-bunting"
            style={{ animationDelay: `${(index % 6) * 0.2}s` }}
          />
        );
      })}
      {Array.from({ length: 14 }, (_, index) => (
        <circle
          key={`bulb-${index}`}
          cx={60 + index * 82}
          cy={192 + (index % 2) * 8}
          r={6}
          fill="#ffe59a"
          className="ck-twinkle"
          style={{ animationDelay: `${index * 0.25}s` }}
        />
      ))}
      <path d="M0 190 Q600 230 1200 190" fill="none" stroke="#2e3a40" strokeWidth={2} opacity={0.6} />
      <ClementineArt transform="translate(650 190) scale(0.98)" menu={menu} ribbons={ribbons} />
      {[220, 300, 940, 1020].map((x) => (
        <g key={`picnic-${x}`}>
          <path
            d={`M${x - 40} 560 L${x + 40} 560 L${x + 30} 520 L${x - 30} 520 Z`}
            fill="#d9472b"
            opacity={0.85}
          />
          <path
            d={`M${x - 30} 520 L${x + 30} 520 M${x - 35} 540 H${x + 35}`}
            stroke="#f3f0e8"
            strokeWidth={4}
          />
        </g>
      ))}
    </g>
  );
}
