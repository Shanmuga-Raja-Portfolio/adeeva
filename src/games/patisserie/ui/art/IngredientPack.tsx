import { darken, lighten } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { IngredientDef } from "../../content/ingredient";

export interface IngredientPackProps {
  readonly ingredient: IngredientDef;
  readonly size: number;
}

function Bag({
  id,
  colour,
  content,
  label,
}: {
  readonly id: string;
  readonly colour: string;
  readonly content: string;
  readonly label: string;
}) {
  const edge = darken(colour, 0.3);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={darken(colour, 0.14)} />
          <stop offset="0.32" stopColor={lighten(colour, 0.35)} />
          <stop offset="0.7" stopColor={colour} />
          <stop offset="1" stopColor={darken(colour, 0.2)} />
        </linearGradient>
      </defs>
      <path
        d="M-22 -18 Q-24 6 -25 28 Q0 33 25 28 Q24 6 22 -18 Z"
        fill={`url(#${id}-paper)`}
        stroke={edge}
        strokeWidth={1.4}
      />
      <path d="M-15 -14 Q-17 8 -18 27" stroke={edge} strokeOpacity={0.25} strokeWidth={1.2} fill="none" />
      <path d="M15 -14 Q17 8 18 27" stroke={edge} strokeOpacity={0.25} strokeWidth={1.2} fill="none" />
      <ellipse cx={0} cy={-21} rx={22} ry={5} fill={darken(colour, 0.35)} />
      <path
        d="M-19 -21 Q-6 -32 2 -30 Q12 -29 19 -21 Z"
        fill={content}
        stroke={darken(content, 0.18)}
        strokeWidth={1}
      />
      <path
        d="M-8 -26 Q-2 -29 4 -28"
        stroke="#ffffff"
        strokeOpacity={0.8}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M-24 -22 Q0 -17 24 -22 L23 -15 Q0 -10 -23 -15 Z"
        fill={lighten(colour, 0.25)}
        stroke={edge}
        strokeWidth={1.2}
      />
      <rect x={-15} y={-5} width={30} height={19} rx={4} fill="#fffaf0" stroke={edge} strokeOpacity={0.4} />
      <rect
        x={-13}
        y={-3}
        width={26}
        height={15}
        rx={3}
        fill="none"
        stroke="#c86a24"
        strokeOpacity={0.5}
        strokeDasharray="2 1.6"
        strokeWidth={0.8}
      />
      <text
        x={0}
        y={7.5}
        textAnchor="middle"
        fontSize={7.6}
        fontWeight={800}
        fill="#6b4232"
        letterSpacing={0.4}
      >
        {label}
      </text>
    </g>
  );
}

export function IngredientPack({ ingredient, size }: IngredientPackProps) {
  const id = useSvgId("pack");
  const art = (() => {
    switch (ingredient.id) {
      case "flour":
        return <Bag id={id} colour="#e8ddc6" content={ingredient.colour} label="FLOUR" />;
      case "caster-sugar":
        return <Bag id={id} colour="#c8d6ee" content={ingredient.colour} label="SUGAR" />;
      case "icing-sugar":
        return <Bag id={id} colour="#f2d5e0" content={ingredient.colour} label="ICING" />;
      case "cocoa":
        return <Bag id={id} colour="#8a5a42" content={ingredient.colour} label="COCOA" />;
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
