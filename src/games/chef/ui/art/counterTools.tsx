import type { ReactNode } from "react";
import type { CuisineId } from "../../content/cuisine";
import type { SceneIds } from "./kitchenFixtures";

function PastaRack() {
  return (
    <g transform="translate(860 210)">
      <path
        d="M0 140 L20 0 M120 140 L100 0 M20 0 H100 M10 60 H110"
        stroke="#9a6b3c"
        strokeWidth={7}
        strokeLinecap="round"
      />
      {[24, 36, 48, 60, 72, 84, 96].map((x) => (
        <path
          key={x}
          d={`M${x} 60 C${x - 3} 90 ${x + 3} 110 ${x} 130`}
          stroke="#f0cf7a"
          strokeWidth={3}
          fill="none"
        />
      ))}
    </g>
  );
}

function MasalaDabba({ ids }: { readonly ids: SceneIds }) {
  const cups = ["#f0b21e", "#c9402a", "#8a5a34", "#4f8a3c", "#e9862a", "#a07a4a"];
  return (
    <g transform="translate(900 318)">
      <ellipse cx={0} cy={18} rx={70} ry={20} fill="#5f6c73" />
      <ellipse cx={0} cy={10} rx={70} ry={22} fill={`url(#${ids.steel})`} stroke="#5f6c73" strokeWidth={2} />
      {cups.map((colour, index) => {
        const angle = (index / cups.length) * Math.PI * 2;
        return (
          <ellipse
            key={colour}
            cx={Math.cos(angle) * 44}
            cy={10 + Math.sin(angle) * 13}
            rx={14}
            ry={5}
            fill={colour}
          />
        );
      })}
      <ellipse cx={0} cy={10} rx={14} ry={5} fill="#f4ecdc" />
    </g>
  );
}

function Kadai() {
  return (
    <g transform="translate(330 336)">
      <path d="M-70 0 Q0 46 70 0 Z" fill="#3a4448" />
      <ellipse cx={0} cy={0} rx={70} ry={12} fill="#56636a" />
      <path
        d="M-82 -4 a10 8 0 1 1 12 6 M82 -4 a10 8 0 1 0 -12 6"
        stroke="#3a4448"
        strokeWidth={5}
        fill="none"
      />
    </g>
  );
}

function RiceCookerAndDonabe() {
  return (
    <g>
      <g transform="translate(860 262)">
        <rect x={-50} y={0} width={100} height={84} rx={30} fill="#f3f0e8" stroke="#b7b2a6" strokeWidth={3} />
        <rect x={-30} y={34} width={60} height={14} rx={7} fill="#2e3a40" />
        <circle cx={18} cy={41} r={4} fill="#f2a93b" />
      </g>
      <g transform="translate(990 300)">
        <ellipse cx={0} cy={44} rx={56} ry={12} fill="#3a2a22" opacity={0.4} />
        <path d="M-56 10 Q-56 46 0 46 Q56 46 56 10 Z" fill="#6a4a3a" />
        <path d="M-52 10 Q0 -26 52 10 Z" fill="#8a6050" />
        <circle cx={0} cy={-8} r={7} fill="#5a3a2a" />
      </g>
    </g>
  );
}

function Noren() {
  return (
    <g>
      <rect x={60} y={150} width={330} height={8} fill="#c9a77a" />
      {[0, 1, 2].map((index) => (
        <path key={index} d={`M${66 + index * 108} 158 h104 v84 q-52 8 -104 0 Z`} fill="#2e3f6a" />
      ))}
    </g>
  );
}

function ComalAndMolcajete() {
  return (
    <g>
      <g transform="translate(330 340)">
        <ellipse cx={0} cy={0} rx={78} ry={14} fill="#2a2420" />
        <ellipse cx={0} cy={-3} rx={74} ry={11} fill="#3c3430" />
        <ellipse cx={-20} cy={-5} rx={22} ry={5} fill="#ecc35a" />
        <ellipse cx={24} cy={-4} rx={22} ry={5} fill="#ecc35a" />
      </g>
      <g transform="translate(930 330)">
        <path d="M-40 0 Q-46 40 0 42 Q46 40 40 0 Z" fill="#5f5a54" />
        <ellipse cx={0} cy={0} rx={42} ry={10} fill="#4a4540" />
        <ellipse cx={0} cy={0} rx={30} ry={6} fill="#6fae3c" />
        <path
          d="M-30 40 L-34 56 M30 40 L34 56 M0 44 L0 58"
          stroke="#5f5a54"
          strokeWidth={8}
          strokeLinecap="round"
        />
        <path d="M14 -4 L44 -40" stroke="#5f5a54" strokeWidth={12} strokeLinecap="round" />
      </g>
    </g>
  );
}

function CobaltBand() {
  const tiles: ReactNode[] = [];
  for (let index = 0; index < 30; index += 1) {
    const x = index * 40;
    tiles.push(
      <g key={index}>
        <rect x={x} y={200} width={40} height={40} fill="#f1ece0" stroke="#2457a6" strokeWidth={1} />
        <path d={`M${x + 20} 204 L${x + 36} 220 L${x + 20} 236 L${x + 4} 220 Z`} fill="#2457a6" />
        <circle cx={x + 20} cy={220} r={5} fill="#f2a93b" />
      </g>,
    );
  }
  return <g>{tiles}</g>;
}

function CastIronPots() {
  const pots = [
    { x: 870, colour: "#d9472b" },
    { x: 970, colour: "#2f5f8a" },
    { x: 1070, colour: "#4f8a3c" },
  ];
  return (
    <g>
      {pots.map((pot) => (
        <g key={pot.x} transform={`translate(${pot.x} 300)`}>
          <path d="M-40 0 L-40 36 Q0 52 40 36 L40 0 Z" fill={pot.colour} />
          <ellipse cx={0} cy={0} rx={40} ry={9} fill="#2a2420" />
          <path d="M-46 4 h8 M38 4 h8" stroke={pot.colour} strokeWidth={8} strokeLinecap="round" />
          <circle cx={0} cy={-8} r={6} fill="#c9d1d5" />
          <path d="M-36 2 Q0 -14 36 2" stroke={pot.colour} strokeWidth={10} fill="none" />
        </g>
      ))}
    </g>
  );
}

function SlateMenu() {
  return (
    <g transform="translate(80 120)">
      <rect x={0} y={0} width={240} height={150} rx={8} fill="#2f3438" stroke="#8a6a44" strokeWidth={8} />
      {[34, 64, 94, 124].map((y, index) => (
        <path
          key={y}
          d={`M24 ${y} h${140 - index * 14} M${200 - index * 4} ${y} h16`}
          stroke="#f3f0e8"
          strokeWidth={4}
          strokeLinecap="round"
          opacity={0.75}
        />
      ))}
    </g>
  );
}

function StewPotAndBowl() {
  return (
    <g>
      <g transform="translate(330 300)">
        <rect x={-74} y={0} width={148} height={64} rx={8} fill="#aeb9bf" stroke="#5f6c73" strokeWidth={3} />
        <ellipse cx={0} cy={0} rx={74} ry={12} fill="#c4502e" />
        <path d="M-84 14 h10 M74 14 h10" stroke="#5f6c73" strokeWidth={9} strokeLinecap="round" />
        <path
          d="M-30 -10 q8 -20 0 -40 M10 -14 q8 -20 0 -40"
          stroke="#ffffff"
          strokeWidth={5}
          strokeLinecap="round"
          opacity={0.35}
          fill="none"
        />
      </g>
      <g transform="translate(940 340)">
        <path d="M-50 0 Q-50 34 0 34 Q50 34 50 0 Z" fill="#a8603a" />
        <ellipse cx={0} cy={0} rx={50} ry={10} fill="#7a4428" />
        <path d="M10 -2 L40 -54" stroke="#9a6b3c" strokeWidth={12} strokeLinecap="round" />
      </g>
      <g transform="translate(1080 360)">
        <path d="M-34 0 Q-34 26 0 26 Q34 26 34 0 Z" fill="#d9b06a" />
        <ellipse cx={0} cy={0} rx={34} ry={7} fill="#e0612a" />
      </g>
    </g>
  );
}

function MensahBanner() {
  return (
    <g transform="translate(560 150)">
      <rect x={0} y={0} width={240} height={70} rx={6} fill="#4f8a3c" />
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <g key={index} transform={`translate(${20 + index * 40} 35)`}>
          <circle r={12} fill="#f2a93b" />
          <path d="M-12 0 H12 M0 -12 V12" stroke="#4f8a3c" strokeWidth={4} />
          <circle r={4} fill="#d9472b" />
        </g>
      ))}
    </g>
  );
}

export function CounterTools({ cuisine, ids }: { readonly cuisine: CuisineId; readonly ids: SceneIds }) {
  switch (cuisine) {
    case "italian":
      return <PastaRack />;
    case "indian":
      return (
        <>
          <Kadai />
          <MasalaDabba ids={ids} />
        </>
      );
    case "japanese":
      return (
        <>
          <Noren />
          <RiceCookerAndDonabe />
        </>
      );
    case "mexican":
      return (
        <>
          <CobaltBand />
          <ComalAndMolcajete />
        </>
      );
    case "french":
      return (
        <>
          <SlateMenu />
          <CastIronPots />
        </>
      );
    case "west-african":
      return (
        <>
          <MensahBanner />
          <StewPotAndBowl />
        </>
      );
  }
}
