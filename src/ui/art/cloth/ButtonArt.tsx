import type { ReactNode } from "react";
import { darken } from "../colourMix";
import { useSvgId } from "../useSvgId";

export type ButtonKind = "button" | "pearl";

export function buttonBody(kind: ButtonKind, tint: string, id: string): ReactNode {
  const deep = darken(tint, 0.35);
  const gradient = `url(#${id}-g)`;
  if (kind === "button")
    return (
      <>
        <circle cx={0.8} cy={1.4} r={8.4} fill="#1c1220" opacity={0.2} />
        <circle r={8.4} fill={gradient} stroke={deep} strokeWidth={0.8} />
        <circle r={6.2} fill="none" stroke={deep} strokeOpacity={0.4} strokeWidth={0.8} />
        {[
          [-2, -2],
          [2, -2],
          [-2, 2],
          [2, 2],
        ].map(([cx, cy]) => (
          <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={0.95} fill={deep} />
        ))}
        <path d="M-2 -2 L2 2 M2 -2 L-2 2" stroke={darken(tint, 0.55)} strokeWidth={0.7} />
        <path
          d="M-5.6 -3.6 A6.6 6.6 0 0 1 -1 -6.4"
          stroke="#ffffff"
          strokeOpacity={0.7}
          strokeWidth={1.3}
          fill="none"
          strokeLinecap="round"
        />
      </>
    );
  return (
    <>
      <circle cx={0.6} cy={1} r={5} fill="#1c1220" opacity={0.2} />
      <circle r={5} fill={gradient} />
      <circle r={5} fill="none" stroke={darken(tint, 0.3)} strokeOpacity={0.5} strokeWidth={0.5} />
      <ellipse
        cx={-1.6}
        cy={-1.8}
        rx={1.6}
        ry={1.1}
        fill="#ffffff"
        opacity={0.95}
        transform="rotate(-30 -1.6 -1.8)"
      />
      <path
        d="M2.6 2.2 A3.6 3.6 0 0 1 -0.6 3.8"
        stroke="#ffffff"
        strokeOpacity={0.4}
        strokeWidth={0.8}
        fill="none"
      />
    </>
  );
}

export function buttonGradient(kind: ButtonKind, tint: string, id: string): ReactNode {
  return (
    <radialGradient id={`${id}-g`} cx="0.36" cy="0.32" r="0.75">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="0.45" stopColor={tint} />
      <stop offset="1" stopColor={darken(tint, kind === "pearl" ? 0.18 : 0.28)} />
    </radialGradient>
  );
}

export interface ButtonArtProps {
  kind: ButtonKind;
  x: number;
  y: number;
  scale: number;
  tint: string;
}

export function ButtonArt({ kind, x, y, scale, tint }: ButtonArtProps) {
  const id = useSvgId("trim");
  return (
    <g transform={`translate(${x} ${y}) rotate(0) scale(${scale})`} className="ad-trim">
      <defs>{buttonGradient(kind, tint, id)}</defs>
      {buttonBody(kind, tint, id)}
    </g>
  );
}
