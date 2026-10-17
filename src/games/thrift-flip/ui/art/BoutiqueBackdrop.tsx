import { useSvgId } from "../../../../ui/art/useSvgId";

export interface BoutiqueBackdropProps {
  readonly className?: string | undefined;
  readonly signName?: string | undefined;
  readonly dusk?: boolean | undefined;
  readonly view?: string | undefined;
  readonly windowColours?: readonly string[] | undefined;
}

const DEFAULT_WINDOW = ["#f07f63", "#9cb59a", "#b9a7dc"];
const BUNTING = ["#7b7fd1", "#f6d36b", "#e57a8f", "#8fcfb2", "#f08a3c"];

function Larkspur({ x, y, scale = 1 }: { readonly x: number; readonly y: number; readonly scale?: number }) {
  const florets = [0, 1, 2, 3, 4, 5, 6];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 0 Q-2 -40 0 -86" stroke="#4f7a4a" strokeWidth={3} fill="none" />
      <path
        d="M0 -20 Q-16 -30 -22 -18 Q-10 -14 0 -20 Z M0 -34 Q16 -46 22 -32 Q10 -28 0 -34 Z"
        fill="#5f8f56"
      />
      {florets.map((index) => (
        <circle
          key={index}
          cx={index % 2 === 0 ? -5 : 5}
          cy={-44 - index * 7}
          r={6 - index * 0.5}
          fill={index % 3 === 0 ? "#8a7fe0" : index % 3 === 1 ? "#6f6fc4" : "#a99cf0"}
        />
      ))}
    </g>
  );
}

function Planter({ x, y }: { readonly x: number; readonly y: number }) {
  return (
    <g>
      <Larkspur x={x + 18} y={y} scale={0.9} />
      <Larkspur x={x + 40} y={y} scale={1.1} />
      <Larkspur x={x + 62} y={y} />
      <path d={`M${x} ${y} L${x + 80} ${y} L${x + 72} ${y + 44} L${x + 8} ${y + 44} Z`} fill="#b86b46" />
      <path d={`M${x - 2} ${y} L${x + 82} ${y} L${x + 82} ${y + 8} L${x - 2} ${y + 8} Z`} fill="#cf8259" />
    </g>
  );
}

function Neighbour({
  x,
  colour,
  sign,
}: {
  readonly x: number;
  readonly colour: string;
  readonly sign: string;
}) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={0} y={170} width={250} height={350} fill="#e7cfa6" />
      <rect x={0} y={170} width={250} height={350} fill="#000000" opacity={0.04} />
      <rect x={14} y={340} width={222} height={180} fill={colour} />
      <rect x={30} y={360} width={110} height={120} rx={4} fill="#cfe3ec" opacity={0.8} />
      <rect x={156} y={366} width={64} height={154} rx={4} fill="#5c4632" />
      <rect x={14} y={300} width={222} height={40} fill="#3f3a4f" />
      <text x={125} y={327} textAnchor="middle" fontFamily="Georgia, serif" fontSize={20} fill="#f6e7c9">
        {sign}
      </text>
      {[40, 104, 168].map((wx) => (
        <rect
          key={wx}
          x={wx}
          y={200}
          width={44}
          height={70}
          rx={4}
          fill="#f6efe0"
          stroke="#c6a77b"
          strokeWidth={3}
        />
      ))}
    </g>
  );
}

export function BoutiqueBackdrop({
  className,
  signName = "Second Bloom",
  dusk = false,
  windowColours = DEFAULT_WINDOW,
  view = "0 0 1280 720",
}: BoutiqueBackdropProps) {
  const id = useSvgId("boutique");
  const stripes = Array.from({ length: 22 }, (_, index) => index);
  return (
    <svg
      className={
        className ? `tf-backdrop tf-boutique-backdrop ${className}` : "tf-backdrop tf-boutique-backdrop"
      }
      viewBox={view}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dusk ? "#2f3a6b" : "#c9d3f2"} />
          <stop offset="0.6" stopColor={dusk ? "#8a6f9c" : "#f2e8f2"} />
          <stop offset="1" stopColor={dusk ? "#e9a77e" : "#f8e6cf"} />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff8e6" stopOpacity={0.9} />
          <stop offset="1" stopColor="#f6d9a6" stopOpacity={0.85} />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity={0.5} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#fff3c4" stopOpacity={0.95} />
          <stop offset="1" stopColor="#fff3c4" stopOpacity={0} />
        </radialGradient>
        <pattern id={`${id}-brick`} width={60} height={30} patternUnits="userSpaceOnUse">
          <rect width={60} height={30} fill="#efe1c8" />
          <path d="M0 15 H60 M30 0 V15 M0 15 V30 M60 15 V30" stroke="#dcc6a1" strokeWidth={2} />
        </pattern>
        <pattern id={`${id}-cobble`} width={46} height={26} patternUnits="userSpaceOnUse">
          <path d="M2 12 Q12 2 22 12 Q12 22 2 12 Z M24 25 Q34 15 44 25" fill="#a99a86" opacity={0.4} />
        </pattern>
      </defs>
      <rect width={1280} height={720} fill={`url(#${id}-sky)`} />
      <g fill={dusk ? "#3f4266" : "#d9cde6"} opacity={0.75}>
        <path d="M0 220 L0 120 L80 80 L160 120 L160 90 L240 60 L320 100 L320 220 Z" />
        <path d="M960 220 L960 110 L1040 70 L1120 110 L1120 80 L1200 50 L1280 80 L1280 220 Z" />
        <rect x={110} y={58} width={22} height={40} />
        <rect x={1180} y={30} width={22} height={40} />
      </g>
      <Neighbour x={-40} colour="#e2b54a" sign="Bakery" />
      <Neighbour x={1070} colour="#e58c78" sign="Café" />
      <rect x={250} y={110} width={820} height={420} fill={`url(#${id}-brick)`} />
      <path d="M240 110 L1080 110 L1080 124 L240 124 Z" fill="#c9b08a" />
      {[330, 520, 710, 900].map((wx) => (
        <g key={wx}>
          <rect
            x={wx}
            y={140}
            width={90}
            height={110}
            rx={45}
            fill="#f8f1e4"
            stroke="#b79a6e"
            strokeWidth={5}
          />
          <path d={`M${wx + 45} 140 V250 M${wx} 196 H${wx + 90}`} stroke="#b79a6e" strokeWidth={3} />
          <rect x={wx - 8} y={250} width={106} height={16} rx={3} fill="#b86b46" />
          {[0, 1, 2, 3, 4].map((flower) => (
            <circle
              key={flower}
              cx={wx + 6 + flower * 20}
              cy={246}
              r={8}
              fill={flower % 2 === 0 ? "#e57a8f" : "#f6d36b"}
            />
          ))}
        </g>
      ))}
      <rect x={270} y={290} width={780} height={240} fill="#2f6f6a" />
      <rect x={280} y={300} width={760} height={6} fill="#c9a227" opacity={0.7} />
      <rect x={330} y={232} width={660} height={70} rx={10} fill="#245955" stroke="#c9a227" strokeWidth={5} />
      <text
        x={660}
        y={280}
        textAnchor="middle"
        fontFamily="'Rockwell', 'Roboto Slab', Georgia, serif"
        fontSize={40}
        fontWeight={700}
        fill="#f8e7b8"
        letterSpacing={2}
      >
        {signName}
      </text>
      <path d="M346 248 h20 M954 248 h20" stroke="#c9a227" strokeWidth={3} />
      <g>
        {stripes.map((index) => {
          const x = 300 + index * 34;
          return (
            <path
              key={index}
              d={`M${x} 312 L${x + 34} 312 L${x + 34} 352 Q${x + 17} 366 ${x} 352 Z`}
              fill={index % 2 === 0 ? "#7b7fd1" : "#fff4e2"}
            />
          );
        })}
        <path d="M300 312 H1048" stroke="#4b4f9e" strokeWidth={4} />
      </g>
      <rect x={300} y={370} width={420} height={150} rx={6} fill="#1d4744" />
      <rect x={312} y={380} width={396} height={130} rx={4} fill={`url(#${id}-glass)`} />
      <path d="M330 404 Q510 424 690 404" stroke="#f6d36b" strokeWidth={2} fill="none" />
      {[350, 395, 440, 485, 530, 575, 620, 665].map((bx, index) => (
        <circle key={bx} cx={bx} cy={406 + Math.sin(index) * 4} r={5} fill="#fff1a8" className="tf-twinkle" />
      ))}
      <path d="M350 430 H670" stroke="#8a6a4a" strokeWidth={4} />
      {windowColours.slice(0, 3).map((colour, index) => {
        const cx = 400 + index * 110;
        return (
          <g key={`${colour}-${index}`}>
            <path d={`M${cx} 430 q8 0 8 6 q0 5 -8 7 v5`} stroke="#8a8f99" strokeWidth={2} fill="none" />
            <path
              d={`M${cx - 32} 462 L${cx - 10} 448 Q${cx} 454 ${cx + 10} 448 L${cx + 32} 462 L${cx + 24} 476 L${cx + 22} 506 L${cx - 22} 506 L${cx - 24} 476 Z`}
              fill={colour}
              stroke="#00000022"
              strokeWidth={2}
            />
          </g>
        );
      })}
      <rect
        x={312}
        y={380}
        width={396}
        height={130}
        fill={`url(#${id}-shine)`}
        opacity={0.4}
        transform="skewX(-12) translate(80 0)"
      />
      <rect x={750} y={360} width={150} height={170} rx={6} fill="#1d4744" />
      <rect x={764} y={374} width={122} height={156} rx={4} fill="#245955" />
      <rect x={780} y={390} width={90} height={70} rx={4} fill={`url(#${id}-glass)`} opacity={0.9} />
      <circle cx={866} cy={470} r={6} fill="#c9a227" />
      <g className="tf-shop-bell">
        <path d="M825 360 v12" stroke="#8a6a4a" strokeWidth={2} />
        <path d="M815 384 Q815 370 825 370 Q835 370 835 384 Z" fill="#c9a227" />
      </g>
      <g transform="rotate(-4 825 418)">
        <path d="M806 404 L825 396 L844 404" fill="none" stroke="#8a6a4a" strokeWidth={1.5} />
        <rect x={798} y={404} width={54} height={24} rx={3} fill="#fff4e2" stroke="#a07a52" strokeWidth={2} />
        <text
          x={825}
          y={421}
          textAnchor="middle"
          fontSize={13}
          fontWeight={700}
          fill="#2f6f6a"
          fontFamily="system-ui"
        >
          OPEN
        </text>
      </g>
      <rect x={930} y={370} width={110} height={150} rx={6} fill="#1d4744" />
      <rect x={940} y={380} width={90} height={130} rx={4} fill={`url(#${id}-glass)`} opacity={0.85} />
      <path
        d="M955 412 h60 M955 432 h44 M955 452 h52"
        stroke="#a07a52"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Planter x={680} y={486} />
      <Planter x={900} y={486} />
      <path d="M-20 70 Q320 140 640 90 T1300 80" fill="none" stroke="#6b5235" strokeWidth={2} />
      {Array.from({ length: 28 }, (_, index) => {
        const x = -10 + index * 48;
        const t = (x + 20) / 1320;
        const y = 70 + Math.sin(t * Math.PI) * 40 - (t > 0.5 ? 8 : 0);
        return (
          <path
            key={x}
            d={`M${x} ${y} L${x + 32} ${y + 2} L${x + 16} ${y + 30} Z`}
            fill={BUNTING[index % BUNTING.length]}
            opacity={0.95}
          />
        );
      })}
      <g>
        <rect x={180} y={300} width={10} height={230} fill="#3f3a4f" />
        <circle cx={185} cy={300} r={40} fill={`url(#${id}-glow)`} opacity={dusk ? 1 : 0.5} />
        <path d="M168 300 L202 300 L196 276 L174 276 Z" fill="#3f3a4f" />
        <rect x={176} y={282} width={18} height={16} fill="#fff1a8" />
      </g>
      <g transform="translate(1000 452)">
        <path d="M0 0 L40 0 L56 78 L-16 78 Z" fill="#2f3d38" stroke="#a07a52" strokeWidth={4} />
        <text x={20} y={26} textAnchor="middle" fontSize={11} fill="#f6f2e4" fontFamily="system-ui">
          Mends
        </text>
        <text x={20} y={42} textAnchor="middle" fontSize={11} fill="#f6f2e4" fontFamily="system-ui">
          &amp; hems
        </text>
        <path d="M6 56 q14 -8 28 0" stroke="#f6d36b" strokeWidth={2} fill="none" />
      </g>
      <rect y={520} width={1280} height={200} fill="#cdbfaa" />
      <rect y={520} width={1280} height={200} fill={`url(#${id}-cobble)`} />
      <rect y={520} width={1280} height={10} fill="#b3a48d" />
    </svg>
  );
}
