import type { AccessoryId } from "../../../engine/avatar";

export interface AvatarAccessoryProps {
  accessory: AccessoryId;
}

const CROWN_FLOWERS = [
  { x: -30, y: -30, fill: "#f08aa8" },
  { x: -20, y: -42, fill: "#f6ecc8" },
  { x: -7, y: -48, fill: "#b9a7dc" },
  { x: 7, y: -48, fill: "#f08aa8" },
  { x: 20, y: -42, fill: "#f6ecc8" },
  { x: 30, y: -30, fill: "#b9a7dc" },
] as const;

export function AvatarAccessory({ accessory }: AvatarAccessoryProps) {
  switch (accessory) {
    case "star-clip":
      return (
        <g transform="translate(25 -31) rotate(14)" className="ad-avatar-accessory">
          <path
            d="M0 -9 L2.6 -3 L9 -2.6 L4 1.6 L5.6 8 L0 4.6 L-5.6 8 L-4 1.6 L-9 -2.6 L-2.6 -3 Z"
            fill="#f2c14e"
            stroke="#9a7a14"
            strokeWidth={1}
            strokeLinejoin="round"
          />
          <circle cx={-1.6} cy={-2.4} r={1.2} fill="#fff6d0" />
        </g>
      );
    case "round-glasses":
      return (
        <g className="ad-avatar-accessory" fill="none" stroke="#3a2a36" strokeWidth={1.8}>
          <circle cx={-12.5} cy={1} r={8.2} fill="#ffffff" fillOpacity={0.18} />
          <circle cx={12.5} cy={1} r={8.2} fill="#ffffff" fillOpacity={0.18} />
          <path d="M-4.4 0 Q0 -3 4.4 0" />
          <path d="M-20.6 -1 L-31 -4 M20.6 -1 L31 -4" strokeLinecap="round" />
          <path d="M-16 -3 L-13 -5" stroke="#ffffff" strokeOpacity={0.8} strokeLinecap="round" />
        </g>
      );
    case "flower-crown":
      return (
        <g className="ad-avatar-accessory">
          <path
            d="M-34 -24 C-26 -44 -10 -52 0 -52 C10 -52 26 -44 34 -24"
            fill="none"
            stroke="#557a61"
            strokeWidth={2.2}
          />
          {CROWN_FLOWERS.map((flower) => (
            <g key={`${flower.x}${flower.y}`} transform={`translate(${flower.x} ${flower.y})`}>
              <circle cx={-3} cy={0} r={3} fill={flower.fill} />
              <circle cx={3} cy={0} r={3} fill={flower.fill} />
              <circle cx={0} cy={-3} r={3} fill={flower.fill} />
              <circle cx={0} cy={3} r={3} fill={flower.fill} />
              <circle r={1.8} fill="#e2b93b" />
            </g>
          ))}
        </g>
      );
  }
}
