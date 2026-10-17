import { darken, lighten } from "../../../../ui/art/colourMix";

export interface FabricCrateProps {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly folds: readonly string[];
  readonly roll: string;
}

export function FabricCrate({ x, y, scale, folds, roll }: FabricCrateProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={8} cy={4} rx={118} ry={14} fill="#3b2a1c" opacity={0.3} />
      <g transform="rotate(-24 60 -120)">
        <rect x={40} y={-190} width={36} height={150} rx={18} fill={roll} />
        <rect x={40} y={-190} width={12} height={150} rx={6} fill={lighten(roll, 0.3)} opacity={0.6} />
        <ellipse cx={58} cy={-190} rx={18} ry={7} fill={lighten(roll, 0.2)} />
        <ellipse cx={58} cy={-190} rx={5} ry={2.5} fill={darken(roll, 0.3)} />
      </g>
      {folds.map((colour, index) => (
        <g key={`${colour}-${index}`} transform={`translate(${-78 + index * 8} ${-96 - index * 20})`}>
          <rect width={130 - index * 14} height={22} rx={8} fill={colour} />
          <rect width={130 - index * 14} height={7} rx={3.5} fill={lighten(colour, 0.35)} opacity={0.8} />
          <path d={`M10 22 h${110 - index * 14}`} stroke={darken(colour, 0.25)} strokeWidth={2} />
        </g>
      ))}
      <path d="M-104 -96 L104 -96 L96 0 L-96 0 Z" fill="#b98451" />
      <path d="M-104 -96 L104 -96 L102 -80 L-102 -80 Z" fill="#d9a774" />
      <path d="M-100 -58 L100 -58 M-98 -30 L98 -30" stroke="#8a5c33" strokeWidth={4} />
      <path d="M-104 -96 L-96 0 M104 -96 L96 0" stroke="#7a4f2a" strokeWidth={6} />
      <rect x={-40} y={-74} width={80} height={30} rx={4} fill="#fff4e2" stroke="#a07a52" strokeWidth={2} />
      <text
        x={0}
        y={-53}
        textAnchor="middle"
        fontFamily="'Rockwell', 'Roboto Slab', Georgia, serif"
        fontSize={16}
        fontWeight={700}
        fill="#b85a17"
      >
        FINDS
      </text>
    </g>
  );
}
