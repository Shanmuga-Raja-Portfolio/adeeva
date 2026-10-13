import type { ReactNode } from "react";
import { type AccessoryId, type AvatarLook, HAIR_COLOURS, SKIN_TONES } from "../../../engine/avatar";
import { AvatarAccessory } from "./AvatarAccessory";
import { AvatarFace, type AvatarMood } from "./AvatarFace";
import { AvatarHairBack, AvatarHairFront } from "./AvatarHair";
import { AvatarOutfitBody, AvatarOutfitDefs, AvatarOutfitSleeves } from "./AvatarOutfit";
import { darken, lighten } from "../colourMix";
import { CroquisArms, CroquisBody, DOLL_VIEWBOX } from "./Croquis";
import { useSvgId } from "../useSvgId";

export interface AvatarGarment {
  defs: (idBase: string) => ReactNode;
  body: (idBase: string) => ReactNode;
  sleeves: (idBase: string) => ReactNode;
}

export interface AvatarFigureProps {
  look: AvatarLook;
  mood?: AvatarMood | undefined;
  garment?: AvatarGarment | undefined;
  accessory?: AccessoryId | null | undefined;
}

const headTransform = "translate(200 81) scale(1.08)";

export function skinHex(look: AvatarLook): string {
  return SKIN_TONES.find((tone) => tone.id === look.skinTone)?.hex ?? "#c58c5c";
}

function hairHex(look: AvatarLook): string {
  return HAIR_COLOURS.find((colour) => colour.id === look.hairColour)?.hex ?? "#3d2516";
}

export function AvatarFigure({ look, mood = "happy", garment, accessory }: AvatarFigureProps) {
  const idBase = useSvgId("avatar");
  const skin = skinHex(look);
  const hair = hairHex(look);
  const faceGradient = `${idBase}-face`;
  return (
    <g className="ad-avatar-figure">
      <defs>
        <radialGradient id={faceGradient} cx="0.42" cy="0.4" r="0.7">
          <stop offset="0" stopColor={lighten(skin, 0.12)} />
          <stop offset="0.6" stopColor={skin} />
          <stop offset="1" stopColor={darken(skin, 0.14)} />
        </radialGradient>
      </defs>
      {garment ? garment.defs(idBase) : <AvatarOutfitDefs outfit={look.outfit} idBase={idBase} />}
      <g transform={headTransform}>
        <AvatarHairBack style={look.hairStyle} colour={hair} />
      </g>
      <CroquisBody skinTone={skin} head="none" />
      {garment ? garment.body(idBase) : <AvatarOutfitBody outfit={look.outfit} idBase={idBase} />}
      <CroquisArms skinTone={skin} />
      {garment ? garment.sleeves(idBase) : <AvatarOutfitSleeves outfit={look.outfit} idBase={idBase} />}
      <g transform={headTransform}>
        <AvatarFace skin={skin} hair={hair} mood={mood} gradientId={faceGradient} />
        <AvatarHairFront style={look.hairStyle} colour={hair} />
        {accessory ? <AvatarAccessory accessory={accessory} /> : null}
      </g>
    </g>
  );
}

export interface AvatarProps extends AvatarFigureProps {
  variant?: "portrait" | "full" | undefined;
  title?: string | undefined;
  framed?: boolean | undefined;
  frameColour?: string | undefined;
  size?: number | undefined;
  className?: string | undefined;
}

const portraitBox = { x: 118, y: 20, size: 164 };

export function Avatar({
  look,
  mood,
  garment,
  accessory,
  variant = "portrait",
  title,
  framed = true,
  frameColour = "#f8dfe7",
  size,
  className,
}: AvatarProps) {
  const frameId = useSvgId("avatar-frame");
  const label = title ?? "Character portrait";
  if (variant === "full") {
    return (
      <svg
        className={className}
        viewBox={DOLL_VIEWBOX}
        width={size !== undefined ? size / 2 : undefined}
        height={size}
        role="img"
        aria-label={label}
      >
        <AvatarFigure look={look} mood={mood} garment={garment} accessory={accessory} />
      </svg>
    );
  }
  const { x, y, size: box } = portraitBox;
  const cx = x + box / 2;
  const cy = y + box / 2;
  return (
    <svg
      className={className}
      viewBox={`${x} ${y} ${box} ${box}`}
      width={size}
      height={size}
      role="img"
      aria-label={label}
    >
      <defs>
        <clipPath id={`${frameId}-clip`}>
          {framed ? (
            <circle cx={cx} cy={cy} r={box / 2 - 2} />
          ) : (
            <rect x={x} y={y} width={box} height={box} />
          )}
        </clipPath>
        <radialGradient id={`${frameId}-bg`} cx="0.5" cy="0.35" r="0.75">
          <stop offset="0" stopColor={lighten(frameColour, 0.55)} />
          <stop offset="1" stopColor={frameColour} />
        </radialGradient>
      </defs>
      {framed ? <circle cx={cx} cy={cy} r={box / 2 - 2} fill={`url(#${frameId}-bg)`} /> : null}
      <g clipPath={`url(#${frameId}-clip)`}>
        <AvatarFigure look={look} mood={mood} garment={garment} accessory={accessory} />
      </g>
      {framed ? (
        <circle
          cx={cx}
          cy={cy}
          r={box / 2 - 2}
          fill="none"
          stroke="#ffffff"
          strokeWidth={3}
          strokeOpacity={0.9}
        />
      ) : null}
    </svg>
  );
}
