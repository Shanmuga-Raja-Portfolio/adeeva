import type { FurnitureId } from "../../content/furniture";
import { furnitureById } from "../../core";

interface FurnitureSymbolProps {
  readonly furnitureId: FurnitureId;
  readonly cell: number;
  readonly fill: string;
}

function Detail({ furnitureId, w, d, c }: { furnitureId: FurnitureId; w: number; d: number; c: number }) {
  const line = { fill: "none", stroke: "#ffffff", strokeWidth: 2, strokeLinecap: "round" as const };
  switch (furnitureId) {
    case "single-bed":
    case "bunk-bed":
      return (
        <g>
          <rect x={c * 0.25} y={c * 0.2} width={w - c * 0.5} height={c * 0.45} rx={c * 0.15} {...line} />
          <path d={`M${c * 0.12} ${d * 0.45} L${w - c * 0.12} ${d * 0.45}`} {...line} />
          {furnitureId === "bunk-bed" ? (
            <path
              d={`M${w - c * 0.2} ${d * 0.55} L${w - c * 0.2} ${d - c * 0.2}`}
              {...line}
              strokeDasharray="4 4"
            />
          ) : null}
        </g>
      );
    case "sofa":
    case "armchair":
      return (
        <g>
          <path
            d={`M${c * 0.15} ${d - c * 0.2} L${c * 0.15} ${c * 0.3} L${w - c * 0.15} ${c * 0.3} L${w - c * 0.15} ${d - c * 0.2}`}
            {...line}
          />
          <path d={`M${c * 0.4} ${c * 0.55} L${w - c * 0.4} ${c * 0.55}`} {...line} />
        </g>
      );
    case "desk":
    case "coffee-table":
      return <rect x={c * 0.18} y={c * 0.18} width={w - c * 0.36} height={d - c * 0.36} rx={4} {...line} />;
    case "desk-chair":
      return <circle cx={w / 2} cy={d / 2} r={c * 0.24} {...line} />;
    case "dining-table":
      return (
        <g>
          <circle cx={w / 2} cy={d / 2} r={Math.min(w, d) * 0.32} {...line} />
          <path d={`M${w / 2 - c * 0.15} ${d / 2} L${w / 2 + c * 0.15} ${d / 2}`} {...line} />
        </g>
      );
    case "wardrobe":
      return (
        <g>
          <path d={`M${w / 2} ${c * 0.15} L${w / 2} ${d - c * 0.15}`} {...line} />
          <path
            d={`M${c * 0.2} ${d - c * 0.2} L${w - c * 0.2} ${d - c * 0.2}`}
            {...line}
            strokeDasharray="3 5"
          />
        </g>
      );
    case "bookcase":
      return (
        <g>
          {[0.25, 0.5, 0.75].map((share) => (
            <path key={share} d={`M${w * share} ${c * 0.18} L${w * share} ${d - c * 0.18}`} {...line} />
          ))}
        </g>
      );
    case "toy-box":
      return (
        <path
          d={`M${w / 2} ${c * 0.2} l${c * 0.08} ${c * 0.17} l${c * 0.19} 0 l${-c * 0.15} ${c * 0.12} l${c * 0.06} ${c * 0.18} l${-c * 0.18} ${-c * 0.11} l${-c * 0.18} ${c * 0.11} l${c * 0.06} ${-c * 0.18} l${-c * 0.15} ${-c * 0.12} l${c * 0.19} 0 Z`}
          {...line}
        />
      );
    case "window-seat":
      return (
        <rect x={c * 0.12} y={c * 0.12} width={w - c * 0.24} height={d - c * 0.24} rx={c * 0.2} {...line} />
      );
    case "double-bed":
    case "daybed":
      return (
        <g>
          <rect x={c * 0.2} y={c * 0.2} width={w * 0.4 - c * 0.2} height={c * 0.45} rx={c * 0.15} {...line} />
          <rect
            x={w * 0.55}
            y={c * 0.2}
            width={w * 0.45 - c * 0.2}
            height={c * 0.45}
            rx={c * 0.15}
            {...line}
          />
          <path d={`M${c * 0.12} ${d * 0.42} L${w - c * 0.12} ${d * 0.42}`} {...line} />
        </g>
      );
    case "bedside-table":
    case "plant-stand":
      return <circle cx={w / 2} cy={d / 2} r={c * 0.22} {...line} />;
    case "chest-of-drawers":
    case "sideboard":
    case "console-table":
      return (
        <g>
          {[0.33, 0.66].map((share) => (
            <path key={share} d={`M${w * share} ${c * 0.18} L${w * share} ${d - c * 0.18}`} {...line} />
          ))}
        </g>
      );
    case "dining-set":
      return (
        <g>
          <rect x={c * 0.3} y={c * 0.3} width={w - c * 0.6} height={d - c * 0.6} rx={c * 0.2} {...line} />
          {[0.25, 0.5, 0.75].map((share) => (
            <circle key={share} cx={w * share} cy={c * 0.14} r={c * 0.07} {...line} />
          ))}
        </g>
      );
    case "hall-bench":
      return (
        <g>
          <path d={`M${c * 0.2} ${d * 0.6} L${w - c * 0.2} ${d * 0.6}`} {...line} />
          {[0.3, 0.5, 0.7].map((share) => (
            <circle key={share} cx={w * share} cy={d * 0.3} r={c * 0.05} {...line} />
          ))}
        </g>
      );
    case "bean-bag":
      return (
        <path
          d={`M${w * 0.25} ${d * 0.75} Q${w * 0.2} ${d * 0.2} ${w / 2} ${d * 0.22} Q${w * 0.85} ${d * 0.3} ${w * 0.75} ${d * 0.75} Z`}
          {...line}
        />
      );
    case "play-tent":
      return (
        <path
          d={`M${c * 0.2} ${d - c * 0.2} L${w / 2} ${c * 0.2} L${w - c * 0.2} ${d - c * 0.2} Z`}
          {...line}
        />
      );
    case "upright-piano":
      return (
        <g>
          {[0.2, 0.35, 0.5, 0.65, 0.8].map((share) => (
            <path key={share} d={`M${w * share} ${d * 0.5} L${w * share} ${d - c * 0.15}`} {...line} />
          ))}
        </g>
      );
  }
}

export function FurnitureSymbol({ furnitureId, cell, fill }: FurnitureSymbolProps) {
  const def = furnitureById(furnitureId);
  const w = def.width * cell;
  const d = def.depth * cell;
  return (
    <g>
      <rect x={3} y={3} width={w - 6} height={d - 6} rx={9} fill={fill} stroke="#ffffff" strokeWidth={2.5} />
      <Detail furnitureId={furnitureId} w={w} d={d} c={cell} />
    </g>
  );
}

export function symbolTransform(
  furnitureId: FurnitureId,
  cell: number,
  centreX: number,
  centreY: number,
  rotation: number,
): string {
  const def = furnitureById(furnitureId);
  return `translate(${centreX} ${centreY}) rotate(${rotation}) translate(${(-def.width * cell) / 2} ${(-def.depth * cell) / 2})`;
}
