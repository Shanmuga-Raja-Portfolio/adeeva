import { darken, lighten } from "../../../../ui/art/colourMix";
import type { IngredientDef } from "../../content/ingredient";

export interface IngredientPackProps {
  readonly ingredient: IngredientDef;
  readonly size: number;
}

function Bag({ colour, label }: { readonly colour: string; readonly label: string }) {
  return (
    <g>
      <path
        d="M-20 -24 L20 -24 L24 26 Q0 32 -24 26 Z"
        fill={colour}
        stroke={darken(colour, 0.25)}
        strokeWidth={1.6}
      />
      <path
        d="M-20 -24 L-14 -30 L14 -30 L20 -24"
        fill={lighten(colour, 0.2)}
        stroke={darken(colour, 0.25)}
        strokeWidth={1.6}
      />
      <rect x={-14} y={-6} width={28} height={16} rx={3} fill="#fffaf0" />
      <text x={0} y={6} textAnchor="middle" fontSize={9} fontWeight={700} fill="#6b4232">
        {label}
      </text>
    </g>
  );
}

export function IngredientPack({ ingredient, size }: IngredientPackProps) {
  const art = (() => {
    switch (ingredient.id) {
      case "flour":
        return <Bag colour="#e8ddc6" label="FLOUR" />;
      case "caster-sugar":
        return <Bag colour="#c8d6ee" label="SUGAR" />;
      case "icing-sugar":
        return <Bag colour="#f2d5e0" label="ICING" />;
      case "cocoa":
        return <Bag colour="#8a5a42" label="COCOA" />;
      case "butter":
        return (
          <g>
            <rect
              x={-26}
              y={-12}
              width={52}
              height={26}
              rx={4}
              fill="#f6d77a"
              stroke="#c9a33f"
              strokeWidth={1.6}
            />
            <rect
              x={-26}
              y={-12}
              width={20}
              height={26}
              rx={4}
              fill="#fffaf0"
              stroke="#c9a33f"
              strokeWidth={1.6}
            />
            <path d="M-2 -12 V14 M10 -12 V14" stroke="#e2bd57" strokeWidth={1.2} />
          </g>
        );
      case "milk":
        return (
          <g>
            <path d="M-14 -20 L0 -32 L14 -20 V28 H-14 Z" fill="#fdfcf7" stroke="#9fb7d9" strokeWidth={1.6} />
            <rect x={-14} y={-4} width={28} height={16} fill="#9fd0ee" />
          </g>
        );
      case "vanilla":
        return (
          <g>
            <rect
              x={-10}
              y={-14}
              width={20}
              height={36}
              rx={5}
              fill="#5b3a26"
              stroke="#3b2620"
              strokeWidth={1.4}
            />
            <rect x={-5} y={-26} width={10} height={14} rx={2} fill="#f3e2c8" />
            <rect x={-8} y={0} width={16} height={10} rx={2} fill="#fff1cf" />
          </g>
        );
      case "lemon-zest":
        return (
          <g>
            <ellipse cx={0} cy={4} rx={22} ry={18} fill="#f2d23c" stroke="#c9a91d" strokeWidth={1.6} />
            <ellipse cx={-6} cy={-2} rx={6} ry={4} fill="#fff6a8" opacity={0.7} />
            <path d="M18 -6 q8 -4 10 -12" stroke="#6f9152" strokeWidth={3} fill="none" />
          </g>
        );
      case "honey":
        return (
          <g>
            <path
              d="M-18 -10 Q-22 26 0 28 Q22 26 18 -10 Z"
              fill="#e3a234"
              stroke="#a8711d"
              strokeWidth={1.6}
            />
            <rect
              x={-16}
              y={-22}
              width={32}
              height={12}
              rx={4}
              fill="#a9c98b"
              stroke="#6f9152"
              strokeWidth={1.4}
            />
            <path d="M-8 6 q8 -6 16 0" stroke="#f6cd6d" strokeWidth={3} fill="none" />
          </g>
        );
      case "eggs":
        return (
          <g>
            <path d="M-28 4 H28 L24 22 H-24 Z" fill="#c9b18e" stroke="#8a7457" strokeWidth={1.6} />
            {[-16, 0, 16].map((x) => (
              <ellipse
                key={x}
                cx={x}
                cy={0}
                rx={7}
                ry={9}
                fill="#f3e2c8"
                stroke="#c9b18e"
                strokeWidth={1.2}
              />
            ))}
          </g>
        );
    }
  })();
  return (
    <svg width={size} height={size} viewBox="-32 -36 64 72" aria-hidden="true" focusable="false">
      {art}
    </svg>
  );
}
