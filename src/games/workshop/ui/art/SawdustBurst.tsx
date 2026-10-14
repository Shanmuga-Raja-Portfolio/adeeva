export interface SawdustSpeck {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly drift: number;
}

interface SawdustBurstProps {
  readonly specks: readonly SawdustSpeck[];
}

export function SawdustBurst({ specks }: SawdustBurstProps) {
  return (
    <g className="ww-sawdust" pointerEvents="none" aria-hidden="true">
      {specks.map((speck) => (
        <g key={speck.id} transform={`translate(${speck.x} ${speck.y})`}>
          <circle
            className="ww-sawdust__speck"
            r={speck.size}
            cx={speck.drift}
            fill={speck.id % 3 === 0 ? "#e9c896" : "#f6e2bd"}
            stroke="#b08454"
            strokeWidth={0.12}
          />
        </g>
      ))}
    </g>
  );
}
