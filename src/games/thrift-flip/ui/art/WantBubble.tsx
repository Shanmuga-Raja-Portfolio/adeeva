import type { RecipeId } from "../../content/recipe";
import { recipeById } from "../../core";
import { PLAN_CLOTH } from "./planCloth";
import { ProductPreview } from "./ProductPreview";

export interface WantBubbleProps {
  readonly x: number;
  readonly y: number;
  readonly recipeId: RecipeId | null;
  readonly tail: "left" | "right";
  readonly scale?: number | undefined;
  readonly delay?: number | undefined;
}

const TAILS = {
  left: "M-30 18 L-46 40 L-12 26",
  right: "M30 18 L46 40 L12 26",
} as const;

export function WantBubble({ x, y, recipeId, tail, scale = 1, delay = 0 }: WantBubbleProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="tf-alert" style={{ animationDelay: `${delay}ms` }}>
        <ellipse cx={4} cy={34} rx={40} ry={8} fill="#3b2a1c" opacity={0.12} />
        <path d={TAILS[tail]} fill="#fffaf0" stroke="#e9c9a3" strokeWidth={2.5} strokeLinejoin="round" />
        <rect
          x={-42}
          y={-38}
          width={84}
          height={68}
          rx={22}
          fill="#fffaf0"
          stroke="#e9c9a3"
          strokeWidth={2.5}
        />
        <rect x={-36} y={-33} width={72} height={20} rx={10} fill="#ffffff" opacity={0.7} />
        <path d={TAILS[tail]} fill="#fffaf0" transform="translate(0 -3)" />
        {recipeId === null ? (
          <g transform="translate(0 -4)">
            <path
              d="M0 14 C-22 0 -18 -18 -6 -18 C-2 -18 0 -14 0 -12 C0 -14 2 -18 6 -18 C18 -18 22 0 0 14 Z"
              fill="#e57a8f"
            />
          </g>
        ) : (
          <svg x={-34} y={-38} width={68} height={68}>
            <ProductPreview
              design={{ recipeId, parts: {} }}
              cloth={PLAN_CLOTH[recipeId]}
              title={recipeById(recipeId).name}
            />
          </svg>
        )}
        <circle cx={36} cy={-34} r={13} fill="#f08a3c" stroke="#fffaf0" strokeWidth={3} />
        <path d="M36 -41 V-33" stroke="#fffaf0" strokeWidth={3.5} strokeLinecap="round" />
        <circle cx={36} cy={-27.5} r={2.1} fill="#fffaf0" />
      </g>
    </g>
  );
}
