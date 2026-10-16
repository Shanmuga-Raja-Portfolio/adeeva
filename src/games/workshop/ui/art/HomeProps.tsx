import type { ProductId } from "../../content/product";

const OUTLINE = "#2f2622";

function Teapot({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={OUTLINE} strokeWidth={2.5} strokeLinejoin="round">
      <path d="M-22 0 Q-24 -30 0 -30 Q24 -30 22 0 Z" fill="#9fd0ee" />
      <path d="M22 -18 q16 -4 18 -18" fill="none" strokeWidth={4} />
      <path d="M-22 -20 q-14 2 -12 14" fill="none" strokeWidth={4} />
      <circle cy={-34} r={4} fill="#f2c230" />
      <rect x={34} y={-12} width={16} height={12} rx={3} fill="#fffaf0" />
    </g>
  );
}

function Robin({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={OUTLINE} strokeWidth={2}>
      <ellipse rx={13} ry={10} fill="#8a6a4f" />
      <circle cx={10} cy={-8} r={7} fill="#8a6a4f" />
      <path d="M-4 2 Q2 10 10 0" fill="#f07f63" />
      <path d="M16 -8 l6 2 l-6 2 Z" fill="#f2c230" />
      <circle cx={12} cy={-10} r={1.2} fill={OUTLINE} />
    </g>
  );
}

function Teddy({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={OUTLINE} strokeWidth={2} fill="#c99662">
      <circle cx={-10} cy={-30} r={6} />
      <circle cx={10} cy={-30} r={6} />
      <circle cy={-22} r={12} />
      <ellipse cy={0} rx={14} ry={12} />
      <circle cx={-4} cy={-24} r={1.4} fill={OUTLINE} />
      <circle cx={4} cy={-24} r={1.4} fill={OUTLINE} />
    </g>
  );
}

function Scarf({ x, y }: { x: number; y: number }) {
  return (
    <path d={`M${x} ${y} q10 18 0 46 h12 q8 -26 -2 -46 Z`} fill="#d0587e" stroke={OUTLINE} strokeWidth={2} />
  );
}

function Jar({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={OUTLINE} strokeWidth={2}>
      <rect x={-12} y={-26} width={24} height={26} rx={5} fill="#f6e7c4" />
      <rect x={-13} y={-32} width={26} height={7} rx={2} fill="#c0574a" />
    </g>
  );
}

function Blanket({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={OUTLINE} strokeWidth={2}>
      <rect x={-34} y={-12} width={68} height={12} rx={4} fill="#9fd0ee" />
      <path d="M-30 -6 h60" stroke="#ffffff" strokeWidth={2} strokeDasharray="5 4" />
    </g>
  );
}

function PaintPots({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={OUTLINE} strokeWidth={2}>
      <rect x={-26} y={-18} width={20} height={18} rx={2} fill="#f2c230" />
      <rect x={4} y={-22} width={22} height={22} rx={2} fill="#4a6378" />
    </g>
  );
}

function PlantPot({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={OUTLINE} strokeWidth={2}>
      <path d="M-12 0 h24 l-4 -18 h-16 Z" fill="#d4774f" />
      <path d="M0 -18 C-14 -34 -10 -46 0 -48 C10 -46 14 -34 0 -18 Z" fill="#4f8a5b" />
    </g>
  );
}

export function HomeProps({ productId }: { readonly productId: ProductId }) {
  switch (productId) {
    case "breakfast-table":
      return <Teapot x={200} y={118} />;
    case "birdhouse":
      return <Robin x={252} y={130} />;
    case "toy-chest":
      return <Teddy x={250} y={126} />;
    case "coat-rack":
      return <Scarf x={150} y={176} />;
    case "wall-cupboard":
      return <Jar x={200} y={74} />;
    case "footstool":
      return <Blanket x={200} y={178} />;
    case "step-stool":
      return <PaintPots x={200} y={142} />;
    case "window-bench":
      return <PlantPot x={280} y={166} />;
    case "dining-chair":
    case "cottage-bed":
    case "planter-box":
    case "bookshelf":
    case "plant-stand":
    case "bedside-table":
      return null;
  }
}
