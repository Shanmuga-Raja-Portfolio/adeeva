import { HAIR_COLOURS, type AvatarLook, type OutfitStyleId } from "../../../engine/avatar";
import { darken, lighten } from "../colourMix";
import { useSvgId } from "../useSvgId";
import { skinHex } from "./Avatar";
import { AvatarFace, type AvatarMood } from "./AvatarFace";
import { AvatarHairBack, AvatarHairFront } from "./AvatarHair";

export type TownsfolkPose =
  "clasp" | "point" | "wave" | "mug" | "cheer" | "photo" | "hips" | "behind" | "stroll";

interface Limb {
  readonly upper: number;
  readonly lower: number;
}

interface PoseShape {
  readonly left: Limb;
  readonly right: Limb;
  readonly lean: number;
  readonly tilt: number;
  readonly stance: number;
}

interface OutfitColours {
  readonly top: string;
  readonly outer: string | null;
  readonly bottom: string;
  readonly shoe: string;
  readonly skirt: boolean;
  readonly trim: string;
}

export interface TownsfolkProps {
  readonly look: AvatarLook;
  readonly pose: TownsfolkPose;
  readonly mood?: AvatarMood | undefined;
  readonly sway?: number | undefined;
  readonly lift?: number | undefined;
  readonly flip?: boolean | undefined;
  readonly child?: boolean | undefined;
}

const INK = "#3b2a33";
const SHOULDER_Y = -142;
const HIP_Y = -70;
const HEAD_Y = -198;
const UPPER = 36;
const LOWER = 31;

const POSES: Readonly<Record<TownsfolkPose, PoseShape>> = {
  clasp: {
    left: { upper: 10, lower: -127 },
    right: { upper: 10, lower: -127 },
    lean: 2,
    tilt: -8,
    stance: 1,
  },
  point: { left: { upper: 32, lower: -100 }, right: { upper: 128, lower: 8 }, lean: -2, tilt: 6, stance: -1 },
  wave: { left: { upper: 8, lower: 12 }, right: { upper: 112, lower: 72 }, lean: -3, tilt: 7, stance: 1 },
  mug: { left: { upper: 12, lower: -128 }, right: { upper: 8, lower: 10 }, lean: 3, tilt: -5, stance: -1 },
  cheer: { left: { upper: 150, lower: 16 }, right: { upper: 150, lower: 16 }, lean: 0, tilt: 0, stance: 0 },
  photo: {
    left: { upper: 30, lower: -165 },
    right: { upper: 30, lower: -165 },
    lean: -4,
    tilt: 4,
    stance: 1,
  },
  hips: { left: { upper: 34, lower: -96 }, right: { upper: 34, lower: -96 }, lean: 0, tilt: -6, stance: -1 },
  behind: {
    left: { upper: -14, lower: -30 },
    right: { upper: -14, lower: -30 },
    lean: 5,
    tilt: 9,
    stance: 1,
  },
  stroll: { left: { upper: 10, lower: 16 }, right: { upper: 10, lower: 16 }, lean: 1, tilt: 3, stance: 0 },
};

const OUTFITS: Readonly<Record<OutfitStyleId, OutfitColours>> = {
  "denim-jacket": {
    top: "#f7f1e6",
    outer: "#4f78b8",
    bottom: "#2f3550",
    shoe: "#f4ede0",
    skirt: true,
    trim: "#c9a227",
  },
  cardigan: {
    top: "#f4e8cf",
    outer: "#d9a441",
    bottom: "#4f7d72",
    shoe: "#5a3b2c",
    skirt: false,
    trim: "#8a5a1a",
  },
  blazer: {
    top: "#fdf6ea",
    outer: "#7d4f8c",
    bottom: "#4a4459",
    shoe: "#2b2230",
    skirt: false,
    trim: "#e6c86e",
  },
  "studio-apron": {
    top: "#e8746a",
    outer: "#8fb39a",
    bottom: "#36507a",
    shoe: "#7a4a3a",
    skirt: false,
    trim: "#fffaf2",
  },
  dungarees: {
    top: "#f2c94c",
    outer: "#5b7fb0",
    bottom: "#5b7fb0",
    shoe: "#c8664a",
    skirt: false,
    trim: "#c9a227",
  },
};

function rad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function armPoints(side: -1 | 1, limb: Limb): { elbow: [number, number]; hand: [number, number] } {
  const sx = side * 25;
  const sy = SHOULDER_Y + 6;
  const a = rad(limb.upper);
  const elbow: [number, number] = [sx + side * Math.sin(a) * UPPER, sy + Math.cos(a) * UPPER];
  const b = rad(limb.upper + limb.lower);
  const hand: [number, number] = [elbow[0] + side * Math.sin(b) * LOWER, elbow[1] + Math.cos(b) * LOWER];
  return { elbow, hand };
}

function Arm({ side, limb, sleeve, skin }: { side: -1 | 1; limb: Limb; sleeve: string; skin: string }) {
  const { elbow, hand } = armPoints(side, limb);
  const path = `M${side * 25} ${SHOULDER_Y + 6} L${elbow[0].toFixed(1)} ${elbow[1].toFixed(1)} L${hand[0].toFixed(1)} ${hand[1].toFixed(1)}`;
  const cuff: [number, number] = [
    elbow[0] + (hand[0] - elbow[0]) * 0.62,
    elbow[1] + (hand[1] - elbow[1]) * 0.62,
  ];
  return (
    <g>
      <path d={path} fill="none" stroke={INK} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={`M${cuff[0].toFixed(1)} ${cuff[1].toFixed(1)} L${hand[0].toFixed(1)} ${hand[1].toFixed(1)}`}
        stroke={skin}
        strokeWidth={13}
        strokeLinecap="round"
      />
      <path
        d={`M${side * 25} ${SHOULDER_Y + 6} L${elbow[0].toFixed(1)} ${elbow[1].toFixed(1)} L${cuff[0].toFixed(1)} ${cuff[1].toFixed(1)}`}
        fill="none"
        stroke={sleeve}
        strokeWidth={14.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`M${side * 23} ${SHOULDER_Y + 3} L${(elbow[0] - side * 2).toFixed(1)} ${(elbow[1] - 2).toFixed(1)}`}
        stroke={lighten(sleeve, 0.3)}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.55}
      />
      <circle cx={hand[0]} cy={hand[1]} r={8.2} fill={skin} stroke={INK} strokeWidth={1.8} />
      <circle cx={hand[0] - 2} cy={hand[1] - 2.4} r={2.6} fill={lighten(skin, 0.25)} opacity={0.7} />
    </g>
  );
}

function Legs({ outfit, stance, sway }: { outfit: OutfitColours; stance: number; sway: number }) {
  const bend = stance * 7 + sway * 2;
  const legs: readonly [number, number, number][] = [
    [-11, -11 - Math.max(0, bend), Math.max(0, bend) * 0.6],
    [11, 11 + Math.max(0, -bend), Math.max(0, -bend) * 0.6],
  ];
  return (
    <g>
      {legs.map(([hip, foot, knee]) => (
        <g key={hip}>
          <path
            d={`M${hip} ${HIP_Y} Q${hip + knee} ${HIP_Y / 2} ${foot} -6`}
            fill="none"
            stroke={INK}
            strokeWidth={19}
            strokeLinecap="round"
          />
          <path
            d={`M${hip} ${HIP_Y} Q${hip + knee} ${HIP_Y / 2} ${foot} -6`}
            fill="none"
            stroke={outfit.skirt ? "#2f3550" : outfit.bottom}
            strokeWidth={15.5}
            strokeLinecap="round"
          />
          <path
            d={`M${foot - 9} -1 Q${foot - 9} -12 ${foot + 2} -12 Q${foot + 13} -11 ${foot + 13} -1 Z`}
            fill={outfit.shoe}
            stroke={INK}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          <path
            d={`M${foot - 5} -9 Q${foot + 2} -12 ${foot + 8} -9`}
            stroke={lighten(outfit.shoe, 0.4)}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ))}
    </g>
  );
}

function Torso({ outfit, skin }: { outfit: OutfitColours; skin: string }) {
  const body = `M-27 ${SHOULDER_Y + 2} Q0 ${SHOULDER_Y - 7} 27 ${SHOULDER_Y + 2} Q31 ${SHOULDER_Y + 30} 24 -96 Q27 -82 27 ${HIP_Y + 2} Q0 ${HIP_Y + 8} -27 ${HIP_Y + 2} Q-27 -82 -24 -96 Q-31 ${SHOULDER_Y + 30} -27 ${SHOULDER_Y + 2} Z`;
  const outer = outfit.outer ?? outfit.top;
  return (
    <g>
      <path
        d={`M-7 ${SHOULDER_Y - 16} L-7 ${SHOULDER_Y + 2} L7 ${SHOULDER_Y + 2} L7 ${SHOULDER_Y - 16} Z`}
        fill={darken(skin, 0.12)}
        stroke={INK}
        strokeWidth={1.6}
      />
      {outfit.skirt ? (
        <path
          d={`M-28 ${HIP_Y - 8} L28 ${HIP_Y - 8} L36 ${HIP_Y + 30} Q0 ${HIP_Y + 38} -36 ${HIP_Y + 30} Z`}
          fill={outfit.bottom}
          stroke={INK}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      ) : null}
      <path d={body} fill={outfit.top} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
      {outfit.outer !== null ? (
        <g>
          <path
            d={`M-27 ${SHOULDER_Y + 2} Q-14 ${SHOULDER_Y - 5} -8 ${SHOULDER_Y - 3} L-6 ${HIP_Y + 6} Q-18 ${HIP_Y + 6} -27 ${HIP_Y + 2} Q-27 -82 -24 -96 Q-31 ${SHOULDER_Y + 30} -27 ${SHOULDER_Y + 2} Z`}
            fill={outer}
            stroke={INK}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
          <path
            d={`M27 ${SHOULDER_Y + 2} Q14 ${SHOULDER_Y - 5} 8 ${SHOULDER_Y - 3} L6 ${HIP_Y + 6} Q18 ${HIP_Y + 6} 27 ${HIP_Y + 2} Q27 -82 24 -96 Q31 ${SHOULDER_Y + 30} 27 ${SHOULDER_Y + 2} Z`}
            fill={outer}
            stroke={INK}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
          <path
            d={`M-8 ${SHOULDER_Y - 3} L-16 ${SHOULDER_Y + 18} L-7 ${SHOULDER_Y + 26} M8 ${SHOULDER_Y - 3} L16 ${SHOULDER_Y + 18} L7 ${SHOULDER_Y + 26}`}
            fill="none"
            stroke={darken(outer, 0.3)}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {[0, 1, 2].map((index) => (
            <circle key={index} cx={-9} cy={SHOULDER_Y + 34 + index * 14} r={2.2} fill={outfit.trim} />
          ))}
        </g>
      ) : null}
      <path
        d={`M14 ${SHOULDER_Y + 6} Q26 ${SHOULDER_Y + 34} 22 ${HIP_Y + 2} L27 ${HIP_Y + 2} Q31 ${SHOULDER_Y + 30} 27 ${SHOULDER_Y + 2} Z`}
        fill="#1c1220"
        opacity={0.14}
      />
      <path
        d={`M-20 ${SHOULDER_Y + 8} Q-24 ${SHOULDER_Y + 30} -20 -96`}
        stroke="#ffffff"
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
        opacity={0.22}
      />
      <path
        d={`M-26 ${HIP_Y - 4} Q0 ${HIP_Y + 2} 26 ${HIP_Y - 4}`}
        stroke={darken(outfit.outer ?? outfit.top, 0.3)}
        strokeWidth={2}
        fill="none"
        opacity={0.6}
      />
    </g>
  );
}

function Prop({ pose, hand }: { pose: TownsfolkPose; hand: [number, number] }) {
  if (pose === "mug")
    return (
      <g transform={`translate(${hand[0].toFixed(1)} ${(hand[1] - 4).toFixed(1)})`}>
        <path
          d="M-8 -14 L8 -14 L7 4 Q0 7 -7 4 Z"
          fill="#fffaf2"
          stroke={INK}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <path d="M-8 -9 L8 -9" stroke="#c8664a" strokeWidth={3} />
        <path
          d="M-3 -19 q-3 -5 0 -9 M3 -19 q3 -5 0 -9"
          stroke="#ffffff"
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
          opacity={0.85}
        />
      </g>
    );
  if (pose === "photo")
    return (
      <g transform={`translate(${hand[0].toFixed(1)} ${(hand[1] - 10).toFixed(1)})`}>
        <rect x={-11} y={-16} width={22} height={30} rx={4} fill="#2b2230" stroke={INK} strokeWidth={1.4} />
        <rect x={-8} y={-13} width={16} height={22} rx={2} fill="#8fc4ea" />
        <path d="M-8 4 L-2 -3 L3 2 L8 -4 L8 9 L-8 9 Z" fill="#7d8a4a" opacity={0.9} />
      </g>
    );
  return null;
}

export function Townsfolk({
  look,
  pose,
  mood = "happy",
  sway = 0,
  lift = 0,
  flip = false,
  child = false,
}: TownsfolkProps) {
  const gradient = useSvgId("townsfolk");
  const skin = skinHex(look);
  const hair = HAIR_COLOURS.find((colour) => colour.id === look.hairColour)?.hex ?? "#3d2516";
  const outfit = OUTFITS[look.outfit];
  const shape = POSES[pose];
  const sleeve = outfit.outer ?? outfit.top;
  const breathe = sway * 1.6;
  const wave = pose === "wave" ? sway * 18 : pose === "cheer" ? sway * 8 : 0;
  const right: Limb = {
    upper: shape.right.upper + wave * 0.4 - (pose === "stroll" ? sway * 12 : 0),
    lower: shape.right.lower + wave,
  };
  const left: Limb = {
    upper: shape.left.upper + (pose === "cheer" ? -wave * 0.4 : 0),
    lower: shape.left.lower,
  };
  const handRight = armPoints(1, right).hand;
  const handLeft = armPoints(-1, left).hand;
  const both = pose === "photo" || pose === "clasp";
  const propHand: [number, number] = both
    ? [(handLeft[0] + handRight[0]) / 2, Math.min(handLeft[1], handRight[1])]
    : handLeft;
  const behind = pose === "behind";
  const scale = child ? 0.7 : 1;
  const headScale = child ? 1.08 : 0.92;
  return (
    <g transform={`scale(${flip ? -scale : scale} ${scale}) translate(0 ${(-lift).toFixed(1)})`}>
      <defs>
        <radialGradient id={gradient} cx="0.42" cy="0.4" r="0.7">
          <stop offset="0" stopColor={lighten(skin, 0.12)} />
          <stop offset="0.6" stopColor={skin} />
          <stop offset="1" stopColor={darken(skin, 0.14)} />
        </radialGradient>
      </defs>
      <Legs outfit={outfit} stance={shape.stance} sway={sway} />
      <g
        transform={`rotate(${(shape.lean + sway * 1.2).toFixed(2)} 0 ${HIP_Y}) translate(0 ${breathe.toFixed(2)})`}
      >
        {behind ? (
          <g>
            <Arm side={-1} limb={left} sleeve={darken(sleeve, 0.12)} skin={skin} />
            <Arm side={1} limb={right} sleeve={darken(sleeve, 0.12)} skin={skin} />
          </g>
        ) : null}
        <g transform={`translate(0 ${HEAD_Y}) rotate(${shape.tilt}) scale(${headScale})`}>
          <AvatarHairBack style={look.hairStyle} colour={hair} />
        </g>
        <Torso outfit={outfit} skin={skin} />
        {behind ? null : (
          <g>
            <Arm side={-1} limb={left} sleeve={sleeve} skin={skin} />
            <Arm side={1} limb={right} sleeve={sleeve} skin={skin} />
            <Prop pose={pose} hand={propHand} />
          </g>
        )}
        <g transform={`translate(0 ${HEAD_Y}) rotate(${shape.tilt}) scale(${headScale})`}>
          <AvatarFace skin={skin} hair={hair} mood={mood} gradientId={gradient} />
          <AvatarHairFront style={look.hairStyle} colour={hair} />
        </g>
      </g>
    </g>
  );
}
