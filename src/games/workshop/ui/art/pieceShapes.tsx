import type { ReactNode } from "react";
import type { PartOptionId } from "../../content/partOption";
import type { ProductId } from "../../content/product";

interface ShapeKit {
  readonly frame: string;
  readonly surface: string;
  readonly edge: PartOptionId | undefined;
  readonly legs: PartOptionId | undefined;
  readonly accent: PartOptionId | undefined;
  readonly highlight: string | null;
}

const OUTLINE = "#2f2622";
const GLOW = "#f2c230";
const HOLE = "#3b2a20";

function stroke(kit: ShapeKit, partIds: readonly string[]) {
  const lit = kit.highlight !== null && partIds.includes(kit.highlight);
  return {
    stroke: lit ? GLOW : OUTLINE,
    strokeWidth: lit ? 5 : 2.5,
    strokeLinejoin: "round" as const,
    className: lit ? "ww-piece__lit" : undefined,
  };
}

function panelPath(x: number, y: number, w: number, h: number, edge: PartOptionId | undefined): string {
  if (edge === "rounded-edge") {
    const r = Math.min(12, w / 4, h / 4);
    return `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
  }
  if (edge === "arched-edge") {
    const rise = Math.min(14, h * 0.3);
    return `M${x} ${y + rise} Q${x + w / 2} ${y - rise} ${x + w} ${y + rise} V${y + h} H${x} Z`;
  }
  return `M${x} ${y} H${x + w} V${y + h} H${x} Z`;
}

function starPath(cx: number, cy: number, r: number): string {
  const points = Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? r : r * 0.45;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    return `${(cx + Math.cos(angle) * radius).toFixed(1)} ${(cy + Math.sin(angle) * radius).toFixed(1)}`;
  });
  return `M${points.join(" L")} Z`;
}

function Accent({ kit, cx, cy, size }: { kit: ShapeKit; cx: number; cy: number; size: number }) {
  if (kit.accent === "star-cutout")
    return <path d={starPath(cx, cy, size)} fill={HOLE} stroke={OUTLINE} strokeWidth={1.5} />;
  if (kit.accent === "leaf-cutout")
    return (
      <g fill={HOLE} stroke={OUTLINE} strokeWidth={1.5}>
        <path
          d={`M${cx - size} ${cy} Q${cx} ${cy - size} ${cx + size} ${cy} Q${cx} ${cy + size} ${cx - size} ${cy} Z`}
        />
        <path d={`M${cx - size * 0.8} ${cy} L${cx + size * 0.8} ${cy}`} stroke="#6b4d3a" strokeWidth={1} />
      </g>
    );
  if (kit.accent === "slats")
    return (
      <g stroke={HOLE} strokeWidth={3} strokeLinecap="round">
        {[-1, 0, 1].map((step) => (
          <line
            key={step}
            x1={cx + step * size * 0.8}
            y1={cy - size}
            x2={cx + step * size * 0.8}
            y2={cy + size}
          />
        ))}
      </g>
    );
  return null;
}

function Leg({
  kit,
  id,
  x,
  top,
  bottom,
  width,
  side,
}: {
  kit: ShapeKit;
  id: string;
  x: number;
  top: number;
  bottom: number;
  width: number;
  side: -1 | 1;
}) {
  const props = stroke(kit, [id]);
  if (kit.legs === "tapered-legs") {
    const narrow = width * 0.28;
    const d = `M${x} ${top} H${x + width} L${x + width - narrow} ${bottom} H${x + narrow} Z`;
    return <path d={d} fill={kit.frame} {...props} />;
  }
  if (kit.legs === "splayed-legs") {
    const lean = side * (bottom - top) * 0.14;
    const d = `M${x} ${top} H${x + width} L${x + width + lean} ${bottom} H${x + lean} Z`;
    return <path d={d} fill={kit.frame} {...props} />;
  }
  return <rect x={x} y={top} width={width} height={bottom - top} fill={kit.frame} {...props} />;
}

function Birdhouse({ kit }: { kit: ShapeKit }) {
  return (
    <g>
      <rect x={192} y={232} width={16} height={46} fill="#8a6a4f" stroke={OUTLINE} strokeWidth={2} />
      <path
        d={panelPath(140, 128, 120, 108, kit.edge)}
        fill={kit.frame}
        {...stroke(kit, ["gable-1", "side-1", "side-2"])}
      />
      <path d="M200 66 L118 140 L132 152 L200 90 Z" fill={kit.surface} {...stroke(kit, ["roof-1"])} />
      <path d="M200 66 L282 140 L268 152 L200 90 Z" fill={kit.surface} {...stroke(kit, ["roof-2"])} />
      <circle cx={200} cy={160} r={17} fill={HOLE} stroke={OUTLINE} strokeWidth={2} />
      <rect x={196} y={190} width={8} height={16} rx={3} fill="#a4764b" stroke={OUTLINE} strokeWidth={1.5} />
      <rect x={134} y={232} width={132} height={10} rx={2} fill={kit.frame} {...stroke(kit, ["floor"])} />
      <Accent kit={kit} cx={200} cy={218} size={10} />
    </g>
  );
}

function StepStool({ kit }: { kit: ShapeKit }) {
  return (
    <g>
      <path d={panelPath(128, 160, 34, 104, kit.edge)} fill={kit.frame} {...stroke(kit, ["side-1"])} />
      <path d={panelPath(238, 160, 34, 104, kit.edge)} fill={kit.frame} {...stroke(kit, ["side-2"])} />
      <rect x={160} y={182} width={80} height={10} fill={kit.frame} {...stroke(kit, ["rail"])} />
      <rect x={154} y={218} width={92} height={14} rx={2} fill={kit.surface} {...stroke(kit, ["step"])} />
      <path d={panelPath(112, 142, 176, 20, kit.edge)} fill={kit.surface} {...stroke(kit, ["top"])} />
      <Accent kit={kit} cx={145} cy={226} size={9} />
    </g>
  );
}

function PlantStand({ kit }: { kit: ShapeKit }) {
  return (
    <g>
      <g opacity={0.75}>
        <Leg kit={kit} id="leg-3" x={168} top={112} bottom={262} width={11} side={-1} />
        <Leg kit={kit} id="leg-4" x={221} top={112} bottom={262} width={11} side={1} />
      </g>
      <path d={panelPath(150, 186, 100, 12, kit.edge)} fill={kit.surface} {...stroke(kit, ["shelf"])} />
      <Leg kit={kit} id="leg-1" x={146} top={112} bottom={266} width={13} side={-1} />
      <Leg kit={kit} id="leg-2" x={241} top={112} bottom={266} width={13} side={1} />
      <path d={panelPath(132, 98, 136, 16, kit.edge)} fill={kit.surface} {...stroke(kit, ["top"])} />
      <path d="M176 98 L182 66 H218 L224 98 Z" fill="#d4774f" stroke={OUTLINE} strokeWidth={2} />
      <g fill="#4f8a5b" stroke={OUTLINE} strokeWidth={1.5}>
        <path d="M200 66 C186 40 166 34 150 38 C166 44 180 52 196 68 Z" />
        <path d="M200 66 C214 40 234 34 250 38 C234 44 220 52 204 68 Z" />
        <path d="M200 68 C198 42 204 24 214 14 C210 32 208 48 204 68 Z" />
        <path d="M198 68 C182 54 170 56 160 64 C176 62 186 64 196 70 Z" />
      </g>
    </g>
  );
}

function Bookshelf({ kit }: { kit: ShapeKit }) {
  const books = [
    ["#d0587e", 152, 70, 12],
    ["#4a6378", 166, 64, 10],
    ["#f2c230", 178, 72, 14],
    ["#3f6b4f", 194, 66, 9],
    ["#9fd0ee", 158, 128, 16],
    ["#f07f63", 176, 122, 11],
    ["#b9a7dc", 214, 128, 13],
    ["#c58a4a", 160, 186, 12],
    ["#2a8c91", 174, 182, 15],
  ] as const;
  return (
    <g>
      <rect
        x={140}
        y={52}
        width={120}
        height={208}
        fill="#f3e3c8"
        stroke={OUTLINE}
        strokeWidth={1.5}
        opacity={0.6}
      />
      {books.map(([colour, x, y, width]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={width}
          height={(y < 100 ? 92 : y < 160 ? 152 : 212) - y}
          fill={colour}
          stroke={OUTLINE}
          strokeWidth={1.4}
          rx={1.5}
        />
      ))}
      <rect x={146} y={92} width={108} height={12} fill={kit.surface} {...stroke(kit, ["shelf-1"])} />
      <rect x={146} y={152} width={108} height={12} fill={kit.surface} {...stroke(kit, ["shelf-2"])} />
      <rect x={146} y={212} width={108} height={12} fill={kit.surface} {...stroke(kit, ["shelf-3"])} />
      <path d={panelPath(126, 44, 22, 222, kit.edge)} fill={kit.frame} {...stroke(kit, ["side-1"])} />
      <path d={panelPath(252, 44, 22, 222, kit.edge)} fill={kit.frame} {...stroke(kit, ["side-2"])} />
      <Accent kit={kit} cx={137} cy={238} size={7} />
    </g>
  );
}

function ToyChest({ kit }: { kit: ShapeKit }) {
  return (
    <g>
      <rect x={112} y={252} width={22} height={14} rx={3} fill="#8a6a4f" stroke={OUTLINE} strokeWidth={2} />
      <rect x={266} y={252} width={22} height={14} rx={3} fill="#8a6a4f" stroke={OUTLINE} strokeWidth={2} />
      <path
        d={panelPath(104, 148, 192, 108, kit.edge === "arched-edge" ? undefined : kit.edge)}
        fill={kit.frame}
        {...stroke(kit, ["front", "back", "end-1", "end-2", "base"])}
      />
      <g stroke={OUTLINE} strokeWidth={1.5} fill="none" opacity={0.5}>
        <path d="M104 162 h10 v12 h-10 M104 186 h10 v12 h-10 M104 210 h10 v12 h-10 M104 234 h10 v12 h-10" />
        <path d="M296 162 h-10 v12 h10 M296 186 h-10 v12 h10 M296 210 h-10 v12 h10 M296 234 h-10 v12 h10" />
      </g>
      <path d={panelPath(98, 126, 204, 26, kit.edge)} fill={kit.surface} {...stroke(kit, ["lid"])} />
      <Accent kit={kit} cx={200} cy={206} size={18} />
    </g>
  );
}

function BedsideTable({ kit }: { kit: ShapeKit }) {
  return (
    <g>
      <g opacity={0.75}>
        <Leg kit={kit} id="leg-3" x={160} top={132} bottom={262} width={11} side={-1} />
        <Leg kit={kit} id="leg-4" x={229} top={132} bottom={262} width={11} side={1} />
      </g>
      <rect x={150} y={222} width={100} height={10} fill={kit.frame} {...stroke(kit, ["rail-2"])} />
      <Leg kit={kit} id="leg-1" x={136} top={132} bottom={266} width={14} side={-1} />
      <Leg kit={kit} id="leg-2" x={250} top={132} bottom={266} width={14} side={1} />
      <rect x={146} y={136} width={108} height={30} fill={kit.frame} {...stroke(kit, ["rail-1"])} />
      <path d={panelPath(120, 118, 160, 18, kit.edge)} fill={kit.surface} {...stroke(kit, ["top"])} />
      <Accent kit={kit} cx={174} cy={151} size={8} />
      <g>
        <rect x={208} y={84} width={30} height={34} rx={4} fill="#f6e7c4" stroke={OUTLINE} strokeWidth={2} />
        <path
          d="M212 84 L218 60 H228 L234 84 Z"
          fill="#9fd0ee"
          stroke={OUTLINE}
          strokeWidth={2}
          opacity={0.9}
        />
      </g>
    </g>
  );
}

function WindowBench({ kit }: { kit: ShapeKit }) {
  return (
    <g>
      <g opacity={0.75}>
        <Leg kit={kit} id="leg-3" x={108} top={184} bottom={262} width={14} side={-1} />
        <Leg kit={kit} id="leg-4" x={278} top={184} bottom={262} width={14} side={1} />
      </g>
      <rect x={96} y={224} width={208} height={10} fill={kit.frame} {...stroke(kit, ["rail-1", "rail-2"])} />
      <Leg kit={kit} id="leg-1" x={82} top={184} bottom={266} width={18} side={-1} />
      <Leg kit={kit} id="leg-2" x={300} top={184} bottom={266} width={18} side={1} />
      <path d={panelPath(64, 166, 272, 20, kit.edge)} fill={kit.surface} {...stroke(kit, ["seat"])} />
    </g>
  );
}

const DRAWERS: Readonly<Record<ProductId, (props: { kit: ShapeKit }) => ReactNode>> = {
  birdhouse: Birdhouse,
  "step-stool": StepStool,
  "plant-stand": PlantStand,
  bookshelf: Bookshelf,
  "toy-chest": ToyChest,
  "bedside-table": BedsideTable,
  "window-bench": WindowBench,
};

export function PieceShape({ productId, kit }: { readonly productId: ProductId; readonly kit: ShapeKit }) {
  const Drawer = DRAWERS[productId];
  return <Drawer kit={kit} />;
}

export const CUSHION_SPOT: Readonly<Partial<Record<ProductId, { x: number; y: number; width: number }>>> = {
  "window-bench": { x: 80, y: 146, width: 240 },
};
