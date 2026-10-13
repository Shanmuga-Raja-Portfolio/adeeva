import { darken, lighten, luminance, mixHex } from "./colourMix";

export type AvatarMood = "happy" | "neutral" | "delighted" | "thinking";

export interface AvatarFaceProps {
  skin: string;
  hair: string;
  mood: AvatarMood;
  gradientId: string;
}

const FACE_PATH =
  "M0 -42 C22 -42 33 -26 33 -4 C33 18 21 36 0 41 C-21 36 -33 18 -33 -4 C-33 -26 -22 -42 0 -42 Z";

function Eye({ x, iris, mood, flip }: { x: number; iris: string; mood: AvatarMood; flip: boolean }) {
  const side = flip ? -1 : 1;
  if (mood === "delighted") {
    return (
      <path
        d={`M${x - 5.5} 2 Q${x} -4.5 ${x + 5.5} 2`}
        fill="none"
        stroke="#2b2230"
        strokeWidth={2}
        strokeLinecap="round"
      />
    );
  }
  const lookX = mood === "thinking" ? 1.6 : 0;
  const lookY = mood === "thinking" ? -1.4 : 0;
  return (
    <g>
      <ellipse cx={x} cy={0.6} rx={5.2} ry={4.6} fill="#fffaf5" />
      <ellipse cx={x + lookX} cy={0.8 + lookY} rx={3.5} ry={4.1} fill={iris} />
      <circle cx={x + lookX} cy={0.9 + lookY} r={1.9} fill="#1c1220" />
      <circle cx={x + lookX - 1.2} cy={-0.6 + lookY} r={1.1} fill="#ffffff" />
      <circle cx={x + lookX + 1.3} cy={2.2 + lookY} r={0.5} fill="#ffffff" opacity={0.8} />
      <path
        d={`M${x - 5.8 * side} -0.6 Q${x} -6 ${x + 5.8 * side} -0.6 L${x + 7.6 * side} -2.6`}
        fill="none"
        stroke="#2b2230"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function Mouth({ mood, lip }: { mood: AvatarMood; lip: string }) {
  switch (mood) {
    case "delighted":
      return (
        <g>
          <path d="M-8.5 19 Q0 32 8.5 19 Z" fill={darken(lip, 0.45)} />
          <path d="M-7 19.4 Q0 21.6 7 19.4 L6.4 21 Q0 22.6 -6.4 21 Z" fill="#ffffff" />
          <path d="M-4 26.4 Q0 24.4 4 26.4 Q0 28.6 -4 26.4 Z" fill={lighten(lip, 0.2)} />
        </g>
      );
    case "happy":
      return (
        <g>
          <path
            d="M-7.5 20 Q0 27.5 7.5 20"
            fill="none"
            stroke={darken(lip, 0.3)}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <path
            d="M-3.4 24.2 Q0 25.6 3.4 24.2"
            fill="none"
            stroke={lip}
            strokeWidth={1.2}
            strokeLinecap="round"
            opacity={0.6}
          />
        </g>
      );
    case "neutral":
      return (
        <path
          d="M-5 22.4 Q0 24.4 5 22.4"
          fill="none"
          stroke={darken(lip, 0.3)}
          strokeWidth={1.9}
          strokeLinecap="round"
        />
      );
    case "thinking":
      return (
        <path
          d="M-3 23.6 Q2 21.4 7 22.6"
          fill="none"
          stroke={darken(lip, 0.3)}
          strokeWidth={1.9}
          strokeLinecap="round"
        />
      );
  }
}

export function AvatarFace({ skin, hair, mood, gradientId }: AvatarFaceProps) {
  const line = darken(skin, 0.4);
  const brow = luminance(hair) > 0.45 ? mixHex(hair, "#6a4026", 0.55) : darken(hair, 0.1);
  const lip = mixHex("#c2506f", skin, 0.3);
  const iris = luminance(skin) > 0.4 ? "#5a3a2a" : "#3a2418";
  const leftBrow =
    mood === "thinking"
      ? "M-17 -13 Q-11 -17 -6 -14"
      : mood === "delighted"
        ? "M-17 -14 Q-11 -19 -6 -15"
        : "M-17 -12 Q-11 -16 -6 -13";
  const rightBrow =
    mood === "thinking"
      ? "M6 -16 Q12 -21 17 -17"
      : mood === "delighted"
        ? "M6 -15 Q11 -19 17 -14"
        : "M6 -13 Q11 -16 17 -12";
  return (
    <g>
      <ellipse
        cx={-32}
        cy={4}
        rx={5}
        ry={7.5}
        fill={darken(skin, 0.06)}
        stroke={line}
        strokeWidth={0.8}
        strokeOpacity={0.5}
      />
      <ellipse
        cx={32}
        cy={4}
        rx={5}
        ry={7.5}
        fill={darken(skin, 0.06)}
        stroke={line}
        strokeWidth={0.8}
        strokeOpacity={0.5}
      />
      <path d={FACE_PATH} fill={`url(#${gradientId})`} stroke={line} strokeWidth={0.9} strokeOpacity={0.55} />
      <ellipse
        cx={-18}
        cy={13}
        rx={6.4}
        ry={3.8}
        fill="#ec7f94"
        opacity={mood === "delighted" ? 0.42 : 0.26}
      />
      <ellipse
        cx={18}
        cy={13}
        rx={6.4}
        ry={3.8}
        fill="#ec7f94"
        opacity={mood === "delighted" ? 0.42 : 0.26}
      />
      <path d={leftBrow} fill="none" stroke={brow} strokeWidth={2.2} strokeLinecap="round" />
      <path d={rightBrow} fill="none" stroke={brow} strokeWidth={2.2} strokeLinecap="round" />
      <Eye x={-11.5} iris={iris} mood={mood} flip />
      <Eye x={11.5} iris={iris} mood={mood} flip={false} />
      <path
        d="M0.5 7 Q-1.4 13 1.8 14"
        fill="none"
        stroke={line}
        strokeWidth={1.3}
        strokeLinecap="round"
        opacity={0.75}
      />
      <Mouth mood={mood} lip={lip} />
    </g>
  );
}
