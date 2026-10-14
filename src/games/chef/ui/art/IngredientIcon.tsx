import type { ReactNode } from "react";
import { darken, lighten } from "../../../../ui/art/colourMix";
import type { IngredientId, IngredientShape } from "../../content/ingredient";
import { ingredientById } from "../../core";

type ShapeArt = (colour: string, accent: string) => ReactNode;

const SHAPES: Readonly<Record<IngredientShape, ShapeArt>> = {
  bulb: (colour, accent) => (
    <>
      <path
        d="M32 10 C36 18 50 24 50 40 C50 52 42 58 32 58 C22 58 14 52 14 40 C14 24 28 18 32 10 Z"
        fill={colour}
        stroke={darken(colour, 0.3)}
        strokeWidth={2}
      />
      <path
        d="M32 14 C30 26 26 38 28 56 M32 14 C36 28 40 40 38 56"
        stroke={accent}
        strokeWidth={1.5}
        fill="none"
        opacity={0.6}
      />
      <path
        d="M28 8 L32 12 L36 8"
        stroke={darken(accent, 0.2)}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  root: (colour, accent) => (
    <>
      <path
        d="M10 36 C10 24 22 18 32 20 C40 14 54 20 54 32 C56 44 46 50 36 48 C28 54 12 50 10 36 Z"
        fill={colour}
        stroke={darken(colour, 0.3)}
        strokeWidth={2}
      />
      <path
        d="M20 32 q4 -2 8 0 M36 28 q4 -2 8 0 M30 40 q4 -2 8 0"
        stroke={accent}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  round: (colour, accent) => (
    <>
      <circle cx={32} cy={35} r={21} fill={colour} stroke={darken(colour, 0.3)} strokeWidth={2} />
      <ellipse cx={24} cy={28} rx={6} ry={4} fill="#ffffff" opacity={0.4} />
      <path
        d="M32 14 C30 10 26 10 24 12 M32 14 C34 9 40 9 42 12"
        stroke={accent}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  chilli: (colour, accent) => (
    <>
      <path
        d="M14 18 C24 22 36 30 44 44 C48 52 52 56 54 58 C44 56 30 50 22 38 C16 30 12 24 14 18 Z"
        fill={colour}
        stroke={darken(colour, 0.3)}
        strokeWidth={2}
      />
      <path
        d="M14 18 C12 14 10 12 8 12 M14 18 C18 14 22 14 22 14"
        stroke={accent}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M22 26 C28 30 34 36 38 44"
        stroke="#ffffff"
        strokeWidth={2}
        opacity={0.4}
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  leaf: (colour, accent) => (
    <>
      <path d="M32 56 C32 44 32 30 32 18" stroke={accent} strokeWidth={2.5} strokeLinecap="round" />
      <path
        d="M32 40 C22 40 12 32 12 22 C22 22 30 30 32 40 Z"
        fill={colour}
        stroke={accent}
        strokeWidth={1.5}
      />
      <path
        d="M32 32 C42 32 52 24 52 14 C42 14 34 22 32 32 Z"
        fill={colour}
        stroke={accent}
        strokeWidth={1.5}
      />
      <path
        d="M32 22 C26 18 24 12 26 6 C32 8 34 14 32 22 Z"
        fill={lighten(colour, 0.2)}
        stroke={accent}
        strokeWidth={1.5}
      />
    </>
  ),
  block: (colour, accent) => (
    <>
      <path
        d="M10 26 L32 16 L54 26 L54 46 L32 56 L10 46 Z"
        fill={colour}
        stroke={darken(colour, 0.3)}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d="M10 26 L32 36 L54 26 M32 36 L32 56" stroke={darken(colour, 0.2)} strokeWidth={2} fill="none" />
      <path d="M32 36 L54 26 L54 46 L32 56 Z" fill={accent} opacity={0.35} />
    </>
  ),
  bottle: (colour, accent) => (
    <>
      <rect x={26} y={6} width={12} height={10} rx={2} fill={darken(accent, 0.1)} />
      <path
        d="M24 16 L40 16 L42 24 C48 28 48 32 48 36 L48 54 C48 58 44 60 40 60 L24 60 C20 60 16 58 16 54 L16 36 C16 32 16 28 22 24 Z"
        fill={colour}
        stroke={darken(colour, 0.35)}
        strokeWidth={2}
      />
      <rect x={20} y={36} width={24} height={14} rx={3} fill="#f3f0e8" opacity={0.85} />
      <path d="M22 28 L22 52" stroke="#ffffff" strokeWidth={3} opacity={0.35} strokeLinecap="round" />
    </>
  ),
  grain: (colour, accent) => (
    <>
      <path
        d="M12 30 L52 30 C52 46 44 56 32 56 C20 56 12 46 12 30 Z"
        fill="#c9a77a"
        stroke="#8a6a44"
        strokeWidth={2}
      />
      <ellipse cx={32} cy={30} rx={20} ry={7} fill={colour} stroke={accent} strokeWidth={1.5} />
      {[20, 26, 32, 38, 44, 29, 35].map((x, index) => (
        <ellipse key={index} cx={x} cy={index > 4 ? 26 : 30} rx={2.5} ry={1.6} fill={accent} />
      ))}
    </>
  ),
  powder: (colour, accent) => (
    <>
      <ellipse cx={32} cy={44} rx={22} ry={10} fill="#d9d2c4" stroke="#9c9384" strokeWidth={2} />
      <path
        d="M14 42 C18 28 26 22 32 22 C38 22 46 28 50 42 Z"
        fill={colour}
        stroke={accent}
        strokeWidth={1.5}
      />
      <circle cx={28} cy={30} r={2} fill={lighten(colour, 0.35)} />
    </>
  ),
  pasta: (colour, accent) => (
    <>
      {[16, 22, 28, 34, 40, 46].map((x) => (
        <path
          key={x}
          d={`M${x} 8 L${x + 4} 56`}
          stroke={x % 12 === 4 ? accent : colour}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
      ))}
      <rect x={14} y={28} width={40} height={8} rx={3} fill="#2e5f8a" />
    </>
  ),
  egg: (colour, accent) => (
    <>
      <ellipse cx={24} cy={36} rx={13} ry={17} fill={colour} stroke={accent} strokeWidth={2} />
      <ellipse cx={40} cy={38} rx={13} ry={17} fill={lighten(colour, 0.1)} stroke={accent} strokeWidth={2} />
      <ellipse cx={36} cy={30} rx={4} ry={6} fill="#ffffff" opacity={0.6} />
    </>
  ),
  drumstick: (colour, accent) => (
    <>
      <path
        d="M14 22 C14 12 30 8 38 16 C46 24 42 38 32 40 L22 50 L18 46 L26 36 C18 36 14 30 14 22 Z"
        fill={colour}
        stroke={accent}
        strokeWidth={2}
      />
      <circle cx={18} cy={50} r={5} fill="#f6efe2" stroke="#c9bca5" strokeWidth={1.5} />
      <circle cx={24} cy={54} r={4} fill="#f6efe2" stroke="#c9bca5" strokeWidth={1.5} />
    </>
  ),
  sheet: (colour, accent) => (
    <>
      <ellipse cx={32} cy={40} rx={24} ry={12} fill={darken(colour, 0.1)} />
      <ellipse cx={32} cy={34} rx={24} ry={12} fill={colour} stroke={accent} strokeWidth={2} />
      <ellipse cx={32} cy={28} rx={24} ry={12} fill={lighten(colour, 0.08)} stroke={accent} strokeWidth={2} />
    </>
  ),
  cob: (colour, accent) => (
    <>
      <path
        d="M20 54 C14 40 22 14 32 8 C42 14 50 40 44 54 Z"
        fill={colour}
        stroke={darken(colour, 0.3)}
        strokeWidth={2}
      />
      {[16, 24, 32, 40].map((y) => (
        <path key={y} d={`M22 ${y + 8} L42 ${y + 8}`} stroke={darken(colour, 0.2)} strokeWidth={1.4} />
      ))}
      <path d="M20 54 C12 44 10 30 14 20 C18 34 24 44 30 56 Z" fill={accent} />
      <path d="M44 54 C52 44 54 30 50 20 C46 34 40 44 34 56 Z" fill={accent} />
    </>
  ),
  long: (colour, accent) => (
    <>
      <path
        d="M10 44 C20 30 40 18 54 16 C58 18 56 24 52 26 C40 34 26 46 14 52 C8 54 6 48 10 44 Z"
        fill={colour}
        stroke={darken(colour, 0.3)}
        strokeWidth={2}
      />
      <path d="M52 16 C56 12 58 8 58 6" stroke={accent} strokeWidth={4} strokeLinecap="round" />
      <path
        d="M18 42 C28 34 38 28 46 24"
        stroke="#ffffff"
        strokeWidth={2}
        opacity={0.35}
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  pepper: (colour, accent) => (
    <>
      <path
        d="M18 22 C10 30 12 50 22 56 C28 58 30 54 32 54 C34 54 36 58 42 56 C52 50 54 30 46 22 C40 18 36 20 32 20 C28 20 24 18 18 22 Z"
        fill={colour}
        stroke={darken(colour, 0.3)}
        strokeWidth={2}
      />
      <path d="M32 20 C32 14 34 10 38 8" stroke={accent} strokeWidth={4} strokeLinecap="round" fill="none" />
      <path
        d="M22 30 C20 38 22 46 24 50"
        stroke="#ffffff"
        strokeWidth={2.5}
        opacity={0.35}
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  jar: (colour, accent) => (
    <>
      <rect x={18} y={10} width={28} height={8} rx={3} fill={darken(accent, 0.1)} />
      <rect x={14} y={18} width={36} height={40} rx={8} fill="#e9f0f2" stroke="#9fb0b8" strokeWidth={2} />
      <rect x={17} y={28} width={30} height={27} rx={6} fill={colour} />
      <path d="M20 24 L20 50" stroke="#ffffff" strokeWidth={3} opacity={0.5} strokeLinecap="round" />
    </>
  ),
};

export interface IngredientIconProps {
  readonly ingredientId: IngredientId;
  readonly size?: number | undefined;
  readonly title?: string | undefined;
}

export function IngredientIcon({ ingredientId, size = 48, title }: IngredientIconProps) {
  const ingredient = ingredientById(ingredientId);
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role={title === undefined ? undefined : "img"}
      aria-label={title}
      aria-hidden={title === undefined ? true : undefined}
      className="ck-ingredient-icon"
    >
      {SHAPES[ingredient.shape](ingredient.colour, ingredient.accent)}
    </svg>
  );
}
