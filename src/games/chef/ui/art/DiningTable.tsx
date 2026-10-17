import type { AvatarLook } from "../../../../engine/avatar";
import { AvatarFigure } from "../../../../ui/art/avatar/Avatar";
import type { AvatarPose } from "../../../../ui/art/avatar/ArmPose";
import type { AvatarMood } from "../../../../ui/art/avatar/AvatarFace";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { DishId } from "../../content/dish";
import { dishById, ghostLayout } from "../../core";
import { dinerWear, type DinerStyle } from "./dinerWear";
import { PlateGroup } from "./PlateArt";

export type TableMood = "set" | "guests" | "stacked";

export interface DiningTableProps {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly shadow: string;
  readonly mood: TableMood;
  readonly guests: readonly AvatarLook[];
  readonly poses: readonly AvatarPose[];
  readonly sizes: readonly number[];
  readonly faces: readonly AvatarMood[];
  readonly styles: readonly DinerStyle[];
  readonly dishes: readonly DishId[];
  readonly lit: boolean;
}

const GUEST_SCALE = 0.43;
const GUEST_WAIST = 330;
const GUEST_GAP = 90;
const GUEST_LEAN = 5;

function Chair({ x, y, flip }: { readonly x: number; readonly y: number; readonly flip: boolean }) {
  const dir = flip ? -1 : 1;
  return (
    <g>
      <path
        d={`M${x} ${y} v-96 q0 -12 ${dir * 12} -12 h${dir * 40} q${dir * 12} 0 ${dir * 12} 12 v96`}
        fill="none"
        stroke="#4a2516"
        strokeWidth={8}
        strokeLinecap="round"
      />
      <path
        d={`M${x + dir * 6} ${y - 70} h${dir * 52} M${x + dir * 6} ${y - 44} h${dir * 52}`}
        stroke="#6a3a22"
        strokeWidth={6}
      />
      <path d={`M${x + dir * 2} ${y - 94} v52`} stroke="#b0704a" strokeWidth={2.5} opacity={0.5} />
    </g>
  );
}

function Guest({
  look,
  side,
  pose,
  size,
  face,
  style,
}: {
  readonly look: AvatarLook;
  readonly side: 1 | -1;
  readonly pose: AvatarPose;
  readonly size: number;
  readonly face: AvatarMood;
  readonly style: DinerStyle | undefined;
}) {
  const scale = GUEST_SCALE * size;
  const x = side * GUEST_GAP;
  const left = x - 200 * scale * -side;
  return (
    <g transform={`rotate(${-side * GUEST_LEAN * (2 - size)} ${x} 12)`}>
      <g transform={`translate(${left} ${12 - GUEST_WAIST * scale}) scale(${scale * -side} ${scale})`}>
        <AvatarFigure
          look={look}
          mood={face}
          pose={pose}
          garment={style === undefined ? undefined : dinerWear(style)}
        />
      </g>
    </g>
  );
}

function Plate({ x, dishId }: { readonly x: number; readonly dishId: DishId | undefined }) {
  return (
    <g transform={`translate(${x} 4)`}>
      <ellipse cx={3} cy={6} rx={42} ry={11} fill="#5a3a1e" opacity={0.28} />
      {dishId === undefined ? (
        <g>
          <ellipse rx={38} ry={10.5} fill="#ffffff" />
          <ellipse rx={38} ry={10.5} fill="none" stroke="#c9d1d5" strokeWidth={1.5} />
          <ellipse rx={24} ry={6} fill="#eef0f0" />
        </g>
      ) : (
        <PlateGroup
          colour="white"
          components={ghostLayout(dishById(dishId))}
          transform="translate(-40 -14) scale(0.2 0.07)"
        />
      )}
    </g>
  );
}

function Glass({ x }: { readonly x: number }) {
  return (
    <g transform={`translate(${x} -2)`}>
      <path d="M-6 -26 h12 l-2 22 h-8 Z" fill="#dff1f7" opacity={0.75} />
      <path d="M-5 -14 h10 l-1.4 10 h-7.2 Z" fill="#9fd0e0" opacity={0.7} />
      <path d="M-4 -24 v18" stroke="#ffffff" strokeWidth={2} opacity={0.8} />
    </g>
  );
}

export function DiningTable({
  x,
  y,
  scale,
  shadow,
  mood,
  guests,
  poses,
  sizes,
  faces,
  styles,
  dishes,
  lit,
}: DiningTableProps) {
  const id = useSvgId("ck-seat");
  const seated = mood === "guests";
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <clipPath id={`${id}-clip`}>
          <rect x={-240} y={-260} width={480} height={272} />
        </clipPath>
        <linearGradient id={`${id}-cloth`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf4e4" />
          <stop offset="0.7" stopColor="#e9dcc0" />
          <stop offset="1" stopColor="#cdbb98" />
        </linearGradient>
        <radialGradient id={`${id}-top`} cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#fbf3e2" />
          <stop offset="1" stopColor="#eadcbc" />
        </radialGradient>
        <radialGradient id={`${id}-candle`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe2a0" stopOpacity={0.75} />
          <stop offset="1" stopColor="#ffd387" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={0} cy={118} rx={170} ry={22} fill={`url(#${shadow})`} />
      {mood === "stacked" ? null : (
        <>
          <Chair x={-126} y={78} flip={false} />
          <Chair x={126} y={78} flip />
        </>
      )}
      {seated ? (
        <g clipPath={`url(#${id}-clip)`}>
          {guests.slice(0, 2).map((look, index) => (
            <Guest
              key={index}
              look={look}
              side={index === 0 ? -1 : 1}
              pose={poses[index] ?? "talk"}
              size={sizes[index] ?? 1}
              face={faces[index] ?? "happy"}
              style={styles[index]}
            />
          ))}
        </g>
      ) : null}
      <path
        d="M-78 44 L-84 114 M78 44 L84 114 M0 50 V112"
        stroke="#3a1d10"
        strokeWidth={10}
        strokeLinecap="round"
      />
      <ellipse cx={-84} cy={116} rx={13} ry={4} fill="#1a0c06" opacity={0.6} />
      <ellipse cx={84} cy={116} rx={13} ry={4} fill="#1a0c06" opacity={0.6} />
      <path d="M-118 2 H118 L110 56 Q0 70 -110 56 Z" fill={`url(#${id}-cloth)`} />
      <path
        d="M-70 10 Q-72 34 -76 58 M-26 12 Q-24 40 -26 64 M24 12 Q26 40 26 64 M70 10 Q72 34 76 58"
        stroke="#c9b793"
        strokeWidth={4}
        opacity={0.55}
        fill="none"
      />
      <path d="M-110 56 Q0 70 110 56" fill="none" stroke="#b9a57e" strokeWidth={3} />
      <ellipse cx={0} cy={0} rx={118} ry={22} fill={`url(#${id}-top)`} />
      <ellipse cx={0} cy={1} rx={118} ry={22} fill="none" stroke="#e2d2ae" strokeWidth={2} />
      {lit ? <ellipse cx={-8} cy={-2} rx={78} ry={12} fill="#ffe7b0" opacity={0.6} /> : null}
      {mood === "stacked" ? (
        <>
          <g transform="translate(-62 -4) scale(0.8 -0.8)">
            <Chair x={0} y={0} flip={false} />
          </g>
          <g transform="translate(62 -4) scale(0.8 -0.8)">
            <Chair x={0} y={0} flip />
          </g>
        </>
      ) : (
        <>
          <Plate x={-58} dishId={seated ? dishes[0] : undefined} />
          <Plate x={58} dishId={seated ? dishes[1] : undefined} />
          <Glass x={-16} />
          <Glass x={18} />
          <path d="M-104 6 h-8 M104 6 h8" stroke="#8a949a" strokeWidth={3} strokeLinecap="round" />
        </>
      )}
      {lit ? (
        <>
          <ellipse cx={0} cy={-40} rx={46} ry={46} fill={`url(#${id}-candle)`} />
          <rect x={-5} y={-30} width={10} height={28} rx={3} fill="#f8f2e4" />
          <rect x={-5} y={-30} width={4} height={28} rx={2} fill="#ffffff" opacity={0.8} />
          <path d="M0 -50 q7 9 0 18 q-7 -9 0 -18 Z" fill="#ffc35a" className="ck-flicker" />
          <path d="M0 -44 q3 5 0 10 q-3 -5 0 -10 Z" fill="#fff4d0" />
        </>
      ) : null}
    </g>
  );
}
