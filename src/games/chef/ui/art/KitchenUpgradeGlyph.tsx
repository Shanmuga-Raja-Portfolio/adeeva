import type { UpgradeId } from "../../content/upgrade";

export function KitchenUpgradeGlyph({ tool }: { readonly tool: UpgradeId }) {
  switch (tool) {
    case "second-ring":
      return (
        <g>
          <rect x={4} y={18} width={40} height={20} rx={4} fill="#56636a" />
          <circle cx={15} cy={28} r={7} fill="none" stroke="#f2a93b" strokeWidth={3} />
          <circle cx={33} cy={28} r={7} fill="none" stroke="#f2a93b" strokeWidth={3} />
          <circle cx={33} cy={28} r={3} fill="#ffd387" />
        </g>
      );
    case "warming-pass":
      return (
        <g>
          <path d="M10 8 H38 L34 18 H14 Z" fill="#2e3a40" />
          <path d="M14 18 L8 38 H40 L34 18 Z" fill="#f2a93b" opacity={0.35} />
          <ellipse cx={24} cy={38} rx={13} ry={4} fill="#f3f0e8" stroke="#aeb9bf" strokeWidth={1.5} />
          <circle cx={24} cy={35} r={4} fill="#d9472b" />
        </g>
      );
    case "prep-fridge":
      return (
        <g>
          <rect x={10} y={6} width={28} height={38} rx={4} fill="#dfe5e8" stroke="#5f6c73" strokeWidth={2} />
          <path d="M10 20 H38" stroke="#5f6c73" strokeWidth={2} />
          <rect x={14} y={24} width={9} height={6} rx={2} fill="#4f8a3c" />
          <rect x={25} y={24} width={9} height={6} rx={2} fill="#d9472b" />
          <rect x={14} y={33} width={20} height={6} rx={2} fill="#f2a93b" />
        </g>
      );
    case "walk-in-fridge":
      return (
        <g>
          <rect x={6} y={6} width={36} height={38} rx={4} fill="#c9d4d9" stroke="#5f6c73" strokeWidth={2} />
          <rect x={12} y={12} width={24} height={32} rx={2} fill="#eef2f4" />
          <rect x={30} y={24} width={3} height={10} rx={1.5} fill="#5f6c73" />
          <path d="M16 18 l2 -3 l2 3 l-2 3 Z M22 22 l2 -3 l2 3 l-2 3 Z" fill="#9fd3e8" />
        </g>
      );
    case "garden-tables":
      return (
        <g>
          <circle cx={24} cy={12} r={9} fill="#4f8a3c" />
          <rect x={23} y={18} width={2} height={14} fill="#7a5236" />
          <ellipse cx={24} cy={32} rx={16} ry={4} fill="#c9a77a" />
          <path d="M12 34 V44 M36 34 V44" stroke="#7a5236" strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    case "bigger-room":
      return (
        <g>
          <path d="M6 22 L24 8 L42 22 V42 H6 Z" fill="#fbe6c2" stroke="#c47f1a" strokeWidth={2} />
          <rect x={12} y={28} width={10} height={14} rx={2} fill="#d9472b" />
          <rect x={27} y={26} width={10} height={8} rx={1} fill="#9fd3e8" />
          <path d="M30 4 h8 v8" fill="none" stroke="#4f8a3c" strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    default:
      return null;
  }
}
