import { DressFormArt } from "./DressFormArt";
import { GarmentRack } from "./GarmentRack";

export interface StudioSceneProps {
  idBase: string;
}

const bulbs = Array.from({ length: 15 }, (_, index) => {
  const t = index / 14;
  const x = 80 + t * 1440;
  const y = 70 + Math.sin(t * Math.PI * 3) * 22 + 30 * Math.sin(t * Math.PI);
  return { x, y, warm: index % 3 !== 0 };
});

const swatchColours = ["#f2c4c9", "#9fd0ee", "#b9a7dc", "#9cb59a", "#f07f63", "#d9a42b"];

export function BedroomStudio({ idBase }: StudioSceneProps) {
  return (
    <g>
      <defs>
        <linearGradient id={`${idBase}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8ebe6" />
          <stop offset="1" stopColor="#f1dcd5" />
        </linearGradient>
        <pattern id={`${idBase}-paper`} patternUnits="userSpaceOnUse" width={48} height={48}>
          <circle cx={12} cy={12} r={2.2} fill="#e9c6c9" opacity={0.6} />
          <circle cx={36} cy={36} r={2.2} fill="#d8e3d6" opacity={0.7} />
        </pattern>
        <linearGradient id={`${idBase}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b8d5ee" />
          <stop offset="1" stopColor="#f7dbe0" />
        </linearGradient>
        <linearGradient id={`${idBase}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e7cfb6" />
          <stop offset="1" stopColor="#d9bc9e" />
        </linearGradient>
        <radialGradient id={`${idBase}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe6a8" stopOpacity={0.9} />
          <stop offset="1" stopColor="#ffe6a8" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={1600} height={720} fill={`url(#${idBase}-wall)`} />
      <rect width={1600} height={720} fill={`url(#${idBase}-paper)`} />
      <rect y={700} width={1600} height={200} fill={`url(#${idBase}-floor)`} />
      <rect y={692} width={1600} height={14} fill="#f6efe6" />
      <g stroke="#c9a888" strokeWidth={2} opacity={0.4}>
        {[760, 820, 890].map((y) => (
          <line key={y} x1={0} y1={y} x2={1600} y2={y} />
        ))}
        {[180, 520, 860, 1240].map((x, index) => (
          <line key={x} x1={x + index * 30} y1={706} x2={x + index * 30 - 40} y2={900} />
        ))}
      </g>
      <g transform="translate(110 130)">
        <path d="M0 360 L0 120 C0 40 80 0 170 0 C260 0 340 40 340 120 L340 360 Z" fill="#fffaf5" />
        <path
          d="M16 344 L16 124 C16 56 86 18 170 18 C254 18 324 56 324 124 L324 344 Z"
          fill={`url(#${idBase}-sky)`}
        />
        <circle cx={250} cy={90} r={26} fill="#fff4d6" opacity={0.9} />
        <path
          d="M40 200 C60 180 100 184 110 200 C130 190 160 200 156 216 L40 216 Z"
          fill="#ffffff"
          opacity={0.75}
        />
        <path
          d="M190 150 C206 136 236 140 244 152 C262 146 280 156 276 168 L190 168 Z"
          fill="#ffffff"
          opacity={0.6}
        />
        <path d="M170 18 L170 344 M16 190 L324 190" stroke="#fffaf5" strokeWidth={8} />
        <path d="M-30 -10 C30 40 10 200 40 380 L-40 380 Z" fill="#f4c7d2" opacity={0.75} />
        <path d="M370 -10 C310 40 330 200 300 380 L380 380 Z" fill="#f4c7d2" opacity={0.75} />
        <rect x={-20} y={354} width={380} height={18} rx={6} fill="#f6efe6" />
        <path d="M250 354 L262 316 L298 316 L310 354 Z" fill="#d0866c" />
        <path
          d="M280 316 C270 290 254 280 246 266 M280 316 C284 286 300 270 312 262 M280 316 C280 296 280 280 282 260"
          stroke="#6f9a74"
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx={246} cy={266} rx={10} ry={5} fill="#7fa58a" />
        <ellipse cx={312} cy={262} rx={10} ry={5} fill="#7fa58a" />
        <ellipse cx={282} cy={258} rx={6} ry={10} fill="#f2a7c0" />
      </g>
      <path
        d={`M60 60 ${bulbs.map((bulb) => `L${bulb.x.toFixed(0)} ${bulb.y.toFixed(0)}`).join(" ")} L1560 60`}
        stroke="#8a7a6a"
        strokeWidth={2}
        fill="none"
        opacity={0.6}
      />
      {bulbs.map((bulb, index) => (
        <g key={index} transform={`translate(${bulb.x.toFixed(0)} ${(bulb.y + 10).toFixed(0)})`}>
          <circle r={28} fill={`url(#${idBase}-glow)`} opacity={bulb.warm ? 0.7 : 0.45} />
          <ellipse rx={6} ry={9} fill={bulb.warm ? "#ffe3a0" : "#ffd0dc"} />
        </g>
      ))}
      <g transform="translate(640 160)">
        <rect width={360} height={250} rx={10} fill="#d7b48d" stroke="#b48a62" strokeWidth={8} />
        <rect x={10} y={10} width={340} height={230} fill="#dcbd98" opacity={0.6} />
        <g transform="translate(30 26) rotate(-4)">
          <rect width={84} height={120} fill="#fffdf8" />
          <path
            d="M42 18 C50 18 52 30 46 36 L56 70 L66 104 L18 104 L30 70 L38 36 C32 30 34 18 42 18 Z"
            fill="none"
            stroke="#5b4f60"
            strokeWidth={2}
          />
        </g>
        <g transform="translate(132 30) rotate(3)">
          <rect width={84} height={120} fill="#fffdf8" />
          <path
            d="M42 16 C50 16 52 28 46 34 L50 56 L74 108 L10 108 L34 56 L38 34 C32 28 34 16 42 16 Z"
            fill="#f2c4c9"
            opacity={0.6}
            stroke="#5b4f60"
            strokeWidth={2}
          />
        </g>
        {swatchColours.map((colour, index) => (
          <rect
            key={colour}
            x={238 + (index % 2) * 50}
            y={30 + Math.floor(index / 2) * 64}
            width={44}
            height={52}
            fill={colour}
            transform={`rotate(${index % 2 === 0 ? -5 : 4} ${260 + (index % 2) * 50} ${56 + Math.floor(index / 2) * 64})`}
          />
        ))}
        <g transform="translate(40 170) rotate(5)">
          <rect width={150} height={52} fill="#fffdf8" />
          <path
            d="M14 34 C40 10 70 44 96 20 C110 10 126 16 136 26"
            stroke="#d0587e"
            strokeWidth={3}
            fill="none"
          />
        </g>
        {[
          [72, 26],
          [174, 30],
          [258, 30],
          [308, 94],
          [258, 158],
          [114, 172],
        ].map(([px, py]) => (
          <circle
            key={`${px}-${py}`}
            cx={px}
            cy={py}
            r={5}
            fill="#d0587e"
            stroke="#a93d63"
            strokeWidth={1.5}
          />
        ))}
      </g>
      <GarmentRack x={700} y={418} />
      <DressFormArt x={545} y={430} scale={1.0} drape="#efb7c6" gown="half" />
      <g transform="translate(1060 520)">
        <rect x={0} y={60} width={500} height={22} rx={6} fill="#caa47c" />
        <rect x={20} y={82} width={14} height={240} fill="#b48a62" />
        <rect x={466} y={82} width={14} height={240} fill="#b48a62" />
        <rect x={300} y={90} width={170} height={110} rx={6} fill="#d8b893" />
        <circle cx={385} cy={145} r={6} fill="#a07c58" />
        <path
          d="M60 60 L60 10 C60 -6 76 -14 96 -14 L250 -14 C266 -14 272 -4 272 10 L272 30 L230 30 L230 40 L160 40 L160 60 Z"
          fill="#fbf6ef"
          stroke="#c9b5a6"
          strokeWidth={3}
        />
        <rect x={70} y={-4} width={90} height={14} rx={6} fill="#f2c4c9" />
        <circle cx={240} cy={8} r={10} fill="#e9e1d9" stroke="#c9b5a6" strokeWidth={2} />
        <path d="M206 30 L206 54" stroke="#9a96a3" strokeWidth={3} />
        <path
          d="M420 60 L404 -40 L440 -70"
          stroke="#5b4f60"
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
        />
        <path d="M424 -84 L470 -60 L452 -40 Z" fill="#7fa58a" />
        <ellipse cx={460} cy={-44} rx={30} ry={14} fill="#ffe6a8" opacity={0.35} />
        <rect x={320} y={24} width={30} height={36} rx={5} fill="#b9a7dc" />
        <path
          d="M326 24 L322 -2 M334 24 L336 -6 M342 24 L348 0"
          stroke="#d0587e"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(-40 610)">
        <rect x={0} y={60} width={420} height={240} rx={18} fill="#efd6da" />
        <path d="M0 110 C120 92 280 92 420 112 L420 300 L0 300 Z" fill="#b9a7dc" opacity={0.8} />
        <path
          d="M0 140 L420 140 M0 190 L420 190 M0 240 L420 240 M100 110 L100 300 M200 106 L200 300 M300 108 L300 300"
          stroke="#fffaf5"
          strokeWidth={3}
          opacity={0.5}
          strokeDasharray="8 6"
        />
        <rect x={60} y={20} width={150} height={70} rx={30} fill="#fffaf5" />
        <rect x={200} y={30} width={130} height={60} rx={28} fill="#f8dfe7" />
      </g>
      <ellipse cx={820} cy={800} rx={300} ry={56} fill="#f2c4c9" opacity={0.45} />
      <ellipse
        cx={820}
        cy={800}
        rx={240}
        ry={40}
        fill="none"
        stroke="#fffaf5"
        strokeWidth={4}
        strokeDasharray="10 8"
        opacity={0.6}
      />
    </g>
  );
}
