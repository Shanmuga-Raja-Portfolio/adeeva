import { darken, lighten } from "./colourMix";

export interface DressFormArtProps {
  x: number;
  y: number;
  scale?: number | undefined;
  drape?: string | undefined;
  gown?: "half" | "gown" | "none" | undefined;
}

export function DressFormArt({ x, y, scale = 1, drape = "#e9a5b8", gown = "half" }: DressFormArtProps) {
  const deep = darken(drape, 0.25);
  const light = lighten(drape, 0.35);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={300} rx={70} ry={12} fill="#2b2230" opacity={0.08} />
      <path d="M-46 300 L0 284 L46 300" stroke="#8a6a4a" strokeWidth={7} strokeLinecap="round" fill="none" />
      <rect x={-4} y={150} width={8} height={140} rx={3} fill="#a07c58" />
      <rect x={-14} y={-14} width={28} height={16} rx={6} fill="#a07c58" />
      <path
        d="M-18 0 C-40 4 -58 14 -60 30 C-62 50 -50 70 -44 90 C-40 104 -44 120 -50 136 C-54 148 -40 158 0 158 C40 158 54 148 50 136 C44 120 40 104 44 90 C50 70 62 50 60 30 C58 14 40 4 18 0 Z"
        fill="#efe3d3"
        stroke="#b49a7c"
        strokeWidth={2}
      />
      <path d="M0 4 L0 156" stroke="#b49a7c" strokeWidth={1.4} strokeDasharray="4 4" />
      {gown === "half" ? (
        <g>
          <path
            d="M-58 40 C-30 50 30 50 58 40 C56 60 46 80 44 92 C40 106 44 122 50 136 C30 146 -30 146 -50 136 C-44 122 -40 106 -44 92 C-46 80 -56 60 -58 40 Z"
            fill={drape}
          />
          <path
            d="M-50 136 C-70 190 -90 230 -100 262 C-40 276 30 270 60 250 C40 210 50 170 50 136 C20 146 -20 146 -50 136 Z"
            fill={drape}
            opacity={0.92}
          />
          <path
            d="M-20 150 C-30 190 -40 230 -46 268 M10 150 C12 190 20 220 30 258"
            stroke={deep}
            strokeWidth={2}
            fill="none"
            opacity={0.5}
          />
          <path d="M-40 60 C-30 66 -10 68 0 66" stroke={light} strokeWidth={3} fill="none" opacity={0.7} />
          <path
            d="M44 96 C60 110 70 140 64 170"
            stroke="#d0587e"
            strokeWidth={1.6}
            fill="none"
            strokeDasharray="1 5"
            strokeLinecap="round"
          />
        </g>
      ) : null}
      {gown === "gown" ? (
        <g>
          <path
            d="M-56 30 C-30 40 30 40 56 30 C56 60 46 80 44 92 C40 106 44 122 50 136 C70 200 92 250 104 290 C40 304 -40 304 -104 290 C-92 250 -70 200 -50 136 C-44 122 -40 106 -44 92 C-46 80 -56 60 -56 30 Z"
            fill={drape}
          />
          <path
            d="M-30 150 C-44 200 -60 250 -70 292 M0 150 L0 298 M30 150 C44 200 60 250 70 292"
            stroke={deep}
            strokeWidth={2.4}
            fill="none"
            opacity={0.45}
          />
          <path d="M-46 136 Q0 146 46 136" stroke={light} strokeWidth={4} fill="none" opacity={0.8} />
          <path d="M-36 50 C-24 56 -8 58 4 56" stroke={light} strokeWidth={3} fill="none" opacity={0.6} />
        </g>
      ) : null}
    </g>
  );
}
