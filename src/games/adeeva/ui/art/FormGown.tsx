import { darken, lighten } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";

export interface FormGownProps {
  readonly drape: string;
}

const GOWN =
  "M-56 30 C-30 40 30 40 56 30 C56 60 46 80 44 92 C40 106 44 122 50 136 C70 200 92 250 104 290 Q78 305 52 297 Q26 307 0 299 Q-26 307 -52 297 Q-78 305 -104 290 C-92 250 -70 200 -50 136 C-44 122 -40 106 -44 92 C-46 80 -56 60 -56 30 Z";

const SKIRT_SHADOWS = [
  "M-24 146 C-36 196 -52 248 -66 300 L-50 298 C-40 250 -30 198 -24 146 Z",
  "M10 146 C16 198 24 250 30 304 L44 300 C34 250 22 198 10 146 Z",
  "M40 142 C56 196 76 246 92 294 L102 291 C86 246 64 196 40 142 Z",
];

const SKIRT_LIGHTS = [
  "M-36 144 C-52 196 -70 246 -86 296",
  "M-6 148 C-8 200 -10 250 -14 302",
  "M26 146 C36 198 50 250 62 300",
];

const HEM_LACE = [-92, -72, -52, -32, -12, 8, 28, 48, 68, 88];

export function FormGown({ drape }: FormGownProps) {
  const id = useSvgId("gown");
  const deep = darken(drape, 0.32);
  const light = lighten(drape, 0.45);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-cloth`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={lighten(drape, 0.2)} />
          <stop offset="0.38" stopColor={lighten(drape, 0.08)} />
          <stop offset="0.7" stopColor={drape} />
          <stop offset="1" stopColor={darken(drape, 0.34)} />
        </linearGradient>
        <linearGradient id={`${id}-fall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.18} />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="1" stopColor={darken(drape, 0.6)} stopOpacity={0.32} />
        </linearGradient>
        <radialGradient id={`${id}-sheen`} cx="0.3" cy="0.22" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
        <pattern id={`${id}-weave`} patternUnits="userSpaceOnUse" width={6} height={6}>
          <path d="M0 6 L6 0" stroke={darken(drape, 0.4)} strokeWidth={0.7} opacity={0.5} />
        </pattern>
        <clipPath id={`${id}-clip`}>
          <path d={GOWN} />
        </clipPath>
      </defs>
      <path d={GOWN} fill={`url(#${id}-cloth)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <rect x={-110} y={20} width={220} height={290} fill={`url(#${id}-weave)`} opacity={0.22} />
        {SKIRT_SHADOWS.map((d) => (
          <path key={d} d={d} fill={deep} opacity={0.3} />
        ))}
        {SKIRT_LIGHTS.map((d) => (
          <path
            key={d}
            d={d}
            stroke={light}
            strokeWidth={7}
            fill="none"
            opacity={0.32}
            strokeLinecap="round"
          />
        ))}
        <rect x={-110} y={20} width={220} height={290} fill={`url(#${id}-fall)`} />
        <ellipse cx={-18} cy={70} rx={46} ry={50} fill={`url(#${id}-sheen)`} />
        <path
          d="M-104 290 Q-78 305 -52 297 Q-26 307 0 299 Q26 307 52 297 Q78 305 104 290 L104 282 Q78 297 52 289 Q26 299 0 291 Q-26 299 -52 289 Q-78 297 -104 282 Z"
          fill={deep}
          opacity={0.4}
        />
      </g>
      <path
        d="M-22 40 C-24 70 -22 100 -20 136 M22 40 C24 70 22 100 20 136"
        stroke={deep}
        strokeWidth={1.6}
        fill="none"
        opacity={0.45}
      />
      <path
        d="M-56 30 C-30 40 30 40 56 30"
        stroke={light}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="0.1 7"
        opacity={0.95}
      />
      <path d="M-50 126 Q0 138 50 126 L50 142 Q0 154 -50 142 Z" fill={deep} />
      <path d="M-48 129 Q0 140 48 129" stroke={light} strokeWidth={2} fill="none" opacity={0.6} />
      <g transform="translate(30 136)">
        <path d="M0 0 C-14 -14 -30 -10 -26 2 C-22 12 -10 8 0 0 Z" fill={deep} />
        <path d="M0 0 C14 -14 30 -10 26 2 C22 12 10 8 0 0 Z" fill={darken(drape, 0.42)} />
        <path d="M-2 2 C-8 20 -12 34 -18 46 L-10 46 C-6 32 -2 20 2 4 Z" fill={deep} />
        <path d="M2 2 C8 18 14 30 18 40 L24 36 C18 26 10 16 4 2 Z" fill={darken(drape, 0.42)} />
        <circle r={5.5} fill={darken(drape, 0.5)} />
        <path d="M-20 -4 C-14 -8 -8 -6 -4 -2" stroke={light} strokeWidth={1.6} fill="none" opacity={0.7} />
      </g>
      <g fill={light} opacity={0.85}>
        {HEM_LACE.map((x, index) => (
          <circle key={x} cx={x} cy={index % 2 === 0 ? 296 : 300} r={2.2} />
        ))}
      </g>
    </g>
  );
}
