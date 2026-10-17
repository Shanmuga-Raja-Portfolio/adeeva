import { COLOURS } from "../../../../engine/palette";
import { darken, lighten } from "../../../../ui/art/colourMix";
import { DressFormArt } from "./DressFormArt";

export interface AtelierStudioProps {
  idBase: string;
}

const shelfRows = [0, 1, 2];

export function AtelierStudio({ idBase }: AtelierStudioProps) {
  return (
    <g>
      <defs>
        <linearGradient id={`${idBase}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3ece2" />
          <stop offset="1" stopColor="#e8ddcf" />
        </linearGradient>
        <linearGradient id={`${idBase}-window`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dbe8f2" />
          <stop offset="1" stopColor="#f6efe4" />
        </linearGradient>
        <linearGradient id={`${idBase}-beam`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff8e6" stopOpacity={0.75} />
          <stop offset="1" stopColor="#fff8e6" stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${idBase}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9c3a8" />
          <stop offset="1" stopColor="#c8ad8e" />
        </linearGradient>
        <pattern id={`${idBase}-paper`} patternUnits="userSpaceOnUse" width={80} height={96}>
          <rect width={80} height={96} fill="#f4e6dc" />
          <rect width={40} height={96} fill="#f8ede4" />
          <g fill="#d99aa9" opacity={0.42}>
            <path d="M20 22 C24 14 30 14 30 20 C30 26 22 28 20 22 Z" />
            <path d="M20 22 C16 14 10 14 10 20 C10 26 18 28 20 22 Z" />
            <path d="M20 22 C26 26 26 32 20 32 C14 32 14 26 20 22 Z" />
            <circle cx={60} cy={70} r={3} />
          </g>
          <path d="M20 30 L20 44" stroke="#9fb89f" strokeWidth={1.6} opacity={0.5} />
          <path d="M20 38 C24 36 26 38 26 40" stroke="#9fb89f" strokeWidth={1.4} fill="none" opacity={0.5} />
          <path d="M40 0 L40 96" stroke="#e4cfc0" strokeWidth={1.2} />
        </pattern>
        <linearGradient id={`${idBase}-cubby`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9c2a3" />
          <stop offset="1" stopColor="#ecdcc6" />
        </linearGradient>
        <radialGradient id={`${idBase}-glow`} cx="0.5" cy="0.1" r="0.7">
          <stop offset="0" stopColor="#ffe9c4" stopOpacity={0.7} />
          <stop offset="1" stopColor="#ffe9c4" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${idBase}-drape`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c45b7c" />
          <stop offset="0.5" stopColor="#e08aa3" />
          <stop offset="1" stopColor="#b44d6e" />
        </linearGradient>
        <radialGradient id={`${idBase}-rug`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#e6b3bf" />
          <stop offset="0.7" stopColor="#d28fa0" />
          <stop offset="1" stopColor="#b8768a" />
        </radialGradient>
        <pattern id={`${idBase}-herringbone`} patternUnits="userSpaceOnUse" width={60} height={30}>
          <path
            d="M0 30 L30 0 M30 30 L60 0 M0 0 L30 30 M30 0 L60 30"
            stroke="#b89a78"
            strokeWidth={1.4}
            opacity={0.35}
          />
        </pattern>
      </defs>
      <rect width={1600} height={720} fill={`url(#${idBase}-wall)`} />
      <rect width={1600} height={520} fill={`url(#${idBase}-paper)`} />
      <rect width={1600} height={720} fill={`url(#${idBase}-glow)`} />
      <rect y={0} width={1600} height={22} fill="#efe2d3" />
      <rect y={22} width={1600} height={6} fill="#dcc6ae" />
      <rect y={512} width={1600} height={14} fill="#e9d7c4" />
      <rect x={0} y={526} width={1600} height={176} fill="#efe4d6" />
      <g fill="none" stroke="#dccfbd" strokeWidth={3}>
        {[40, 440, 840, 1240].map((x) => (
          <rect key={x} x={x} y={540} width={320} height={140} rx={6} />
        ))}
      </g>
      <rect y={520} width={1600} height={10} fill="#efe6da" />
      <rect y={700} width={1600} height={200} fill={`url(#${idBase}-floor)`} />
      <rect y={700} width={1600} height={200} fill={`url(#${idBase}-herringbone)`} />
      <rect y={690} width={1600} height={16} fill="#f6efe6" />
      {[90, 1260].map((x) => (
        <g key={x} transform={`translate(${x} 80)`}>
          <path d="M0 440 L0 130 C0 50 60 0 125 0 C190 0 250 50 250 130 L250 440 Z" fill="#fbf7f0" />
          <path
            d="M14 426 L14 134 C14 64 66 16 125 16 C184 16 236 64 236 134 L236 426 Z"
            fill={`url(#${idBase}-window)`}
          />
          <path d="M125 16 L125 426 M14 170 L236 170 M14 300 L236 300" stroke="#fbf7f0" strokeWidth={7} />
          <path d="M-36 -20 L286 -20" stroke="#b08a5e" strokeWidth={8} strokeLinecap="round" />
          <path
            d="M-30 -18 C-20 120 -40 300 -24 470 L28 470 C18 320 40 160 30 -18 Z"
            fill={`url(#${idBase}-drape)`}
          />
          <path
            d="M220 -18 C210 160 232 320 222 470 L274 470 C290 300 270 120 280 -18 Z"
            fill={`url(#${idBase}-drape)`}
          />
          <path
            d="M-28 250 Q2 262 32 248 M218 248 Q248 262 278 250"
            stroke="#c9a227"
            strokeWidth={6}
            fill="none"
          />
        </g>
      ))}
      <path d="M100 520 L340 520 L620 900 L260 900 Z" fill={`url(#${idBase}-beam)`} opacity={0.6} />
      <path d="M1270 520 L1510 520 L1360 900 L980 900 Z" fill={`url(#${idBase}-beam)`} opacity={0.5} />
      <g transform="translate(420 110)">
        <rect x={-18} y={-18} width={396} height={398} rx={10} fill="#c9ab88" />
        <rect x={-10} y={-10} width={380} height={380} rx={8} fill={`url(#${idBase}-cubby)`} />
        {shelfRows.map((row) => (
          <g key={row} transform={`translate(0 ${row * 120})`}>
            <rect x={-10} y={-10} width={380} height={30} fill="#5a3b2a" opacity={0.1} />
            {COLOURS.slice(row * 5, row * 5 + 5).map((colour, index) => (
              <g key={colour.id} transform={`translate(${10 + index * 70} ${22 + (index % 2) * 6})`}>
                <ellipse cx={30} cy={74 - (index % 2) * 6} rx={32} ry={6} fill="#3d2618" opacity={0.22} />
                {[0, 1, 2, 3].map((layer) => (
                  <g
                    key={layer}
                    transform={`translate(${layer % 2 === 0 ? 0 : 2} ${layer * (18 - (index % 2) * 1.5)})`}
                  >
                    <rect
                      width={60}
                      height={17}
                      rx={7}
                      fill={layer % 2 === 0 ? colour.hex : darken(colour.hex, 0.08)}
                      stroke={darken(colour.hex, 0.3)}
                      strokeWidth={1.4}
                    />
                    <path
                      d="M6 4 C20 2.5 40 2.5 54 4"
                      stroke={lighten(colour.hex, 0.45)}
                      strokeWidth={2}
                      strokeLinecap="round"
                      fill="none"
                      opacity={0.75}
                    />
                    <path
                      d="M3 13 L57 13"
                      stroke={darken(colour.hex, 0.22)}
                      strokeWidth={1.4}
                      opacity={0.6}
                    />
                  </g>
                ))}
              </g>
            ))}
            <rect x={-14} y={100} width={388} height={14} rx={3} fill="#bf9d76" />
            <rect x={-14} y={100} width={388} height={4} rx={2} fill="#e2c7a4" />
            <rect x={-10} y={114} width={380} height={8} fill="#5a3b2a" opacity={0.16} />
          </g>
        ))}
      </g>
      <g transform="translate(990 150) scale(0.9)" opacity={0.9}>
        <rect width={150} height={190} rx={4} fill="#c9a227" />
        <rect x={10} y={10} width={130} height={170} fill="#fffdf8" />
        <path
          d="M75 30 C84 30 86 44 80 50 L86 80 L112 160 L38 160 L64 80 L70 50 C64 44 66 30 75 30 Z"
          fill="#b9a7dc"
          opacity={0.55}
          stroke="#5b4f60"
          strokeWidth={2}
        />
        <rect x={180} y={40} width={110} height={140} rx={4} fill="#c9a227" />
        <rect x={188} y={48} width={94} height={124} fill="#fffdf8" />
        <path
          d="M235 64 C242 64 244 74 239 79 L246 110 L262 160 L208 160 L224 110 L231 79 C226 74 228 64 235 64 Z"
          fill="#f2c4c9"
          opacity={0.6}
          stroke="#5b4f60"
          strokeWidth={2}
        />
      </g>
      <g transform="translate(800 0)">
        <path d="M0 0 L0 40" stroke="#b49a7c" strokeWidth={3} />
        <path d="M-60 60 Q0 90 60 60" stroke="#c9a227" strokeWidth={4} fill="none" />
        <path d="M-40 52 L-40 72 M0 46 L0 80 M40 52 L40 72" stroke="#c9a227" strokeWidth={3} />
        {[-60, -40, 0, 40, 60].map((x) => (
          <circle
            key={x}
            cx={x}
            cy={x === 0 ? 86 : 70}
            r={7}
            fill="#fff4d6"
            stroke="#c9a227"
            strokeWidth={2}
          />
        ))}
        <circle cx={0} cy={70} r={90} fill="#fff4d6" opacity={0.18} />
      </g>
      <ellipse cx={800} cy={820} rx={560} ry={60} fill={`url(#${idBase}-rug)`} opacity={0.75} />
      <ellipse
        cx={800}
        cy={820}
        rx={530}
        ry={50}
        fill="none"
        stroke="#fff3f0"
        strokeWidth={3}
        opacity={0.6}
        strokeDasharray="10 8"
      />
      <g transform="translate(1470 560)">
        <path d="M-34 140 L-26 70 L26 70 L34 140 Z" fill="#c98c6a" />
        <rect x={-30} y={62} width={60} height={14} rx={4} fill="#b0745a" />
        {[-60, -30, 0, 30, 60].map((angle) => (
          <ellipse
            key={angle}
            cx={0}
            cy={-10}
            rx={14}
            ry={58}
            fill={angle === 0 ? "#6f9a78" : "#7fa58a"}
            transform={`rotate(${angle} 0 64)`}
          />
        ))}
      </g>
      <DressFormArt x={1080} y={360} scale={1.05} drape="#5e2a5a" gown="gown" />
      <DressFormArt x={1220} y={380} scale={0.95} drape="#9fd0ee" gown="half" />
      <g transform="translate(160 640)">
        <rect x={0} y={0} width={780} height={34} rx={8} fill="#b48a62" />
        <rect x={10} y={-6} width={760} height={12} rx={4} fill="#d8b893" />
        <rect x={40} y={34} width={22} height={226} fill="#9a7552" />
        <rect x={718} y={34} width={22} height={226} fill="#9a7552" />
        <rect x={80} y={-22} width={300} height={20} rx={2} fill="#f8f0de" transform="rotate(-2 230 -12)" />
        <path d="M420 -12 L700 -12" stroke="#c9a227" strokeWidth={8} strokeLinecap="round" />
        <path
          d="M430 -16 L430 -8 M470 -16 L470 -8 M510 -16 L510 -8 M550 -16 L550 -8 M590 -16 L590 -8 M630 -16 L630 -8 M670 -16 L670 -8"
          stroke="#8a6d10"
          strokeWidth={2}
        />
        <path
          d="M200 -14 C180 -40 160 -44 150 -30 C142 -18 160 -10 200 -14 Z M200 -14 C190 -46 200 -60 214 -54 C226 -46 218 -28 200 -14 Z"
          fill="none"
          stroke="#5b4f60"
          strokeWidth={4}
        />
        <path d="M200 -14 L260 -30" stroke="#9a96a3" strokeWidth={5} strokeLinecap="round" />
      </g>
    </g>
  );
}
