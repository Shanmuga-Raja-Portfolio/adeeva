import { darken, lighten } from "../../../../../ui/art/colourMix";
import type { ProductId, StackPieceDef } from "../../../content/product";
import { CakeBody } from "../../art/CakeBody";

export interface SlotShape {
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

const SHAPES: Readonly<Partial<Record<ProductId, Readonly<Record<string, SlotShape>>>>> = {
  "layer-cake": {
    stand: { top: 236, width: 210, height: 70 },
    "on-top": { top: 168, width: 210, height: 66 },
  },
  "two-tier-cake": {
    stand: { top: 236, width: 210, height: 70 },
    "on-top": { top: 168, width: 150, height: 66 },
  },
  "three-tier-cake": {
    stand: { top: 254, width: 220, height: 60 },
    "on-big": { top: 196, width: 162, height: 56 },
    "on-middle": { top: 142, width: 108, height: 52 },
  },
  "spiral-roll": { board: { top: 230, width: 250, height: 74 } },
  "biscuit-wreath": {
    "ring-left": { top: 228, width: 130, height: 100 },
    "ring-right": { top: 228, width: 130, height: 100 },
  },
};

const FALLBACK: SlotShape = { top: 200, width: 180, height: 60 };

export function slotShape(productId: ProductId, slotId: string): SlotShape {
  return SHAPES[productId]?.[slotId] ?? FALLBACK;
}

export function slotLeft(productId: ProductId, slotId: string): number {
  const shape = slotShape(productId, slotId);
  if (slotId === "ring-left") return 200 - shape.width - 8;
  if (slotId === "ring-right") return 208;
  return 200 - shape.width / 2;
}

const PIECE_SIZES: Readonly<Record<string, { readonly width: number; readonly height: number }>> = {
  "base-layer": { width: 200, height: 58 },
  "dome-layer": { width: 200, height: 58 },
  "big-tier": { width: 210, height: 70 },
  "middle-tier": { width: 160, height: 56 },
  "small-tier": { width: 140, height: 66 },
};

export interface StackPieceArtProps {
  readonly productId: ProductId;
  readonly piece: StackPieceDef;
  readonly sponge: string;
  readonly fillingColour: string | null;
  readonly top: number;
  readonly cx?: number | undefined;
}

function Log({ cx, top, sponge, fillingColour }: Omit<StackPieceArtProps, "productId" | "piece">) {
  const left = (cx ?? 200) - 110;
  return (
    <g>
      <rect
        x={left}
        y={top}
        width={220}
        height={66}
        rx={33}
        fill={sponge}
        stroke={darken(sponge, 0.3)}
        strokeWidth={1.6}
      />
      <ellipse
        cx={left + 30}
        cy={top + 33}
        rx={24}
        ry={30}
        fill={lighten(sponge, 0.15)}
        stroke={darken(sponge, 0.3)}
      />
      <path
        d={`M${left + 30} ${top + 33} m-14 0 a14 16 0 1 0 28 0 a10 12 0 1 0 -20 0 a6 7 0 1 0 12 0`}
        fill="none"
        stroke={fillingColour ?? lighten(sponge, 0.5)}
        strokeWidth={4}
      />
    </g>
  );
}

function BiscuitHalf({ piece, sponge, top }: Pick<StackPieceArtProps, "piece" | "sponge" | "top">) {
  const first = piece.slot === "ring-right" ? -75 : 105;
  return (
    <g>
      {Array.from({ length: 6 }, (_, index) => {
        const radians = ((first + index * 30) * Math.PI) / 180;
        return (
          <circle
            key={index}
            cx={200 + 100 * Math.cos(radians)}
            cy={top + 76 + 22 * Math.sin(radians)}
            r={15}
            fill={sponge}
            stroke={darken(sponge, 0.25)}
            strokeWidth={1.4}
          />
        );
      })}
    </g>
  );
}

export function StackPieceArt({
  productId,
  piece,
  sponge,
  fillingColour,
  top,
  cx = 200,
}: StackPieceArtProps) {
  if (productId === "spiral-roll")
    return <Log cx={cx} top={top} sponge={sponge} fillingColour={fillingColour} />;
  if (productId === "biscuit-wreath") return <BiscuitHalf piece={piece} sponge={sponge} top={top} />;
  const size = PIECE_SIZES[piece.id] ?? { width: 180, height: 60 };
  const width = productId === "three-tier-cake" ? slotShape(productId, piece.slot).width : size.width;
  const height = productId === "three-tier-cake" ? slotShape(productId, piece.slot).height : size.height;
  return (
    <g>
      <CakeBody
        cx={cx}
        top={top}
        width={width}
        height={height}
        sponge={sponge}
        coat={null}
        fillingColour={fillingColour}
        layered={false}
      />
      {piece.id === "dome-layer" ? (
        <path d={`M${cx - 90} ${top + 2} Q${cx} ${top - 36} ${cx + 90} ${top + 2}`} fill={sponge} />
      ) : null}
    </g>
  );
}

export const ROLL_HEIGHT = 66;

export function pieceHeight(productId: ProductId, piece: StackPieceDef): number {
  if (productId === "spiral-roll") return ROLL_HEIGHT;
  if (productId === "three-tier-cake" || productId === "biscuit-wreath")
    return slotShape(productId, piece.slot).height;
  return PIECE_SIZES[piece.id]?.height ?? 60;
}
