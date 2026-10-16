import type { ReactNode } from "react";
import type { ProductId } from "../../content/product";
import { Accent, Leg, OUTLINE, panelPath, stroke, type ShapeKit } from "./shapeKit";

type RoomProductId =
  | "dining-chair"
  | "breakfast-table"
  | "cottage-bed"
  | "footstool"
  | "planter-box"
  | "coat-rack"
  | "wall-cupboard";

function DiningChair({ kit }: { kit: ShapeKit }) {
  return (
    <g>
      <g opacity={0.8}>
        <Leg kit={kit} id="leg-3" x={150} top={74} bottom={262} width={12} side={-1} />
        <Leg kit={kit} id="leg-4" x={238} top={74} bottom={262} width={12} side={1} />
      </g>
      <path d={panelPath(156, 88, 88, 34, kit.edge)} fill={kit.surface} {...stroke(kit, ["back"])} />
      <Accent kit={kit} cx={200} cy={106} size={9} />
      <rect x={146} y={226} width={108} height={9} fill={kit.frame} {...stroke(kit, ["rail-1", "rail-2"])} />
      <Leg kit={kit} id="leg-1" x={132} top={188} bottom={266} width={14} side={-1} />
      <Leg kit={kit} id="leg-2" x={254} top={188} bottom={266} width={14} side={1} />
      <path d={panelPath(122, 172, 156, 18, kit.edge)} fill={kit.surface} {...stroke(kit, ["seat"])} />
    </g>
  );
}

function BreakfastTable({ kit }: { kit: ShapeKit }) {
  return (
    <g>
      <g opacity={0.75}>
        <Leg kit={kit} id="leg-3" x={104} top={138} bottom={262} width={13} side={-1} />
        <Leg kit={kit} id="leg-4" x={283} top={138} bottom={262} width={13} side={1} />
      </g>
      <rect x={96} y={140} width={208} height={12} fill={kit.frame} {...stroke(kit, ["rail-2"])} />
      <Leg kit={kit} id="leg-1" x={82} top={136} bottom={266} width={16} side={-1} />
      <Leg kit={kit} id="leg-2" x={302} top={136} bottom={266} width={16} side={1} />
      <rect x={98} y={138} width={204} height={14} fill={kit.frame} {...stroke(kit, ["rail-1"])} />
      <path d={panelPath(64, 118, 272, 20, kit.edge)} fill={kit.surface} {...stroke(kit, ["top"])} />
    </g>
  );
}

function CottageBed({ kit }: { kit: ShapeKit }) {
  return (
    <g>
      <path d={panelPath(76, 80, 248, 150, kit.edge)} fill={kit.surface} {...stroke(kit, ["headboard"])} />
      <Accent kit={kit} cx={200} cy={120} size={16} />
      <rect x={70} y={226} width={260} height={12} fill={kit.frame} {...stroke(kit, ["rail-1", "rail-2"])} />
      <g stroke={OUTLINE} strokeWidth={2}>
        <rect x={150} y={146} width={100} height={30} rx={14} fill="#fffaf0" />
        <path d="M84 182 Q200 164 316 182 L316 222 Q200 236 84 222 Z" fill="#f2c4c9" strokeLinejoin="round" />
        <path
          d="M110 200 Q200 190 290 200"
          fill="none"
          stroke="#d0587e"
          strokeWidth={1.6}
          strokeDasharray="6 5"
        />
      </g>
      <path
        d={panelPath(70, 196, 260, 66, kit.edge)}
        fill={kit.frame}
        {...stroke(kit, ["footboard", "slat-1", "slat-2", "slat-3"])}
      />
    </g>
  );
}

function Footstool({ kit }: { kit: ShapeKit }) {
  return (
    <g>
      <g opacity={0.75}>
        <Leg kit={kit} id="leg-3" x={152} top={196} bottom={260} width={12} side={-1} />
        <Leg kit={kit} id="leg-4" x={236} top={196} bottom={260} width={12} side={1} />
      </g>
      <Leg kit={kit} id="leg-1" x={130} top={196} bottom={266} width={15} side={-1} />
      <Leg kit={kit} id="leg-2" x={255} top={196} bottom={266} width={15} side={1} />
      <path d={panelPath(116, 178, 168, 20, kit.edge)} fill={kit.surface} {...stroke(kit, ["top"])} />
    </g>
  );
}

function PlanterBox({ kit }: { kit: ShapeKit }) {
  return (
    <g>
      <g fill="#4f8a5b" stroke={OUTLINE} strokeWidth={1.5}>
        <path d="M150 176 C140 140 150 120 162 112 C162 134 160 156 160 176 Z" />
        <path d="M184 176 C178 130 196 108 212 100 C204 128 198 152 196 176 Z" />
        <path d="M232 176 C238 140 252 130 262 126 C254 146 248 162 244 176 Z" />
        <ellipse cx={170} cy={150} rx={10} ry={6} transform="rotate(-30 170 150)" />
        <ellipse cx={226} cy={140} rx={10} ry={6} transform="rotate(25 226 140)" />
      </g>
      <rect x={98} y={174} width={16} height={88} fill={kit.frame} {...stroke(kit, ["end-1"])} />
      <rect x={286} y={174} width={16} height={88} fill={kit.frame} {...stroke(kit, ["end-2"])} />
      <path
        d={panelPath(110, 168, 180, 96, kit.edge)}
        fill={kit.surface}
        {...stroke(kit, ["side-1", "side-2", "base"])}
      />
      <Accent kit={kit} cx={200} cy={218} size={14} />
    </g>
  );
}

function CoatRack({ kit }: { kit: ShapeKit }) {
  return (
    <g>
      <rect
        x={60}
        y={60}
        width={280}
        height={190}
        fill="#efe3cc"
        opacity={0.55}
        stroke={OUTLINE}
        strokeWidth={1}
      />
      <path d="M84 104 L84 130 L108 104 Z" fill={kit.frame} {...stroke(kit, ["bracket-1"])} />
      <path d="M316 104 L316 130 L292 104 Z" fill={kit.frame} {...stroke(kit, ["bracket-2"])} />
      <rect x={66} y={92} width={268} height={13} rx={2} fill={kit.frame} {...stroke(kit, ["shelf"])} />
      <path d={panelPath(76, 124, 248, 56, kit.edge)} fill={kit.surface} {...stroke(kit, ["back"])} />
      <Accent kit={kit} cx={200} cy={150} size={12} />
    </g>
  );
}

function WallCupboard({ kit }: { kit: ShapeKit }) {
  return (
    <g>
      <rect
        x={60}
        y={50}
        width={280}
        height={220}
        fill="#efe3cc"
        opacity={0.55}
        stroke={OUTLINE}
        strokeWidth={1}
      />
      <rect x={118} y={86} width={20} height={168} fill={kit.frame} {...stroke(kit, ["side-1"])} />
      <rect x={262} y={86} width={20} height={168} fill={kit.frame} {...stroke(kit, ["side-2"])} />
      <rect x={112} y={74} width={176} height={16} rx={2} fill={kit.frame} {...stroke(kit, ["top"])} />
      <rect x={112} y={248} width={176} height={16} rx={2} fill={kit.frame} {...stroke(kit, ["base"])} />
      <path d={panelPath(140, 92, 120, 154, kit.edge)} fill={kit.surface} {...stroke(kit, ["door"])} />
      <Accent kit={kit} cx={200} cy={140} size={16} />
    </g>
  );
}

export const ROOM_DRAWERS: Readonly<Record<RoomProductId, (props: { kit: ShapeKit }) => ReactNode>> = {
  "dining-chair": DiningChair,
  "breakfast-table": BreakfastTable,
  "cottage-bed": CottageBed,
  footstool: Footstool,
  "planter-box": PlanterBox,
  "coat-rack": CoatRack,
  "wall-cupboard": WallCupboard,
};

export const ROOM_CUSHION_SPOTS: Readonly<
  Partial<Record<ProductId, { x: number; y: number; width: number }>>
> = {
  "dining-chair": { x: 128, y: 152, width: 144 },
  footstool: { x: 122, y: 158, width: 156 },
};
