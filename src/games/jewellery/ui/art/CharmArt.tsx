import type { CharmId } from "../../content/extra";
import { Glint } from "./Glint";

interface CharmArtProps {
  readonly charmId: CharmId;
  readonly size?: number | undefined;
}

export function CharmArt({ charmId, size = 1 }: CharmArtProps) {
  return (
    <g transform={`scale(${size})`}>
      <circle cx={0} cy={-15} r={3} fill="none" stroke="#9a7a14" strokeWidth={1.4} />
      {charmId === "star-charm" ? (
        <g>
          <path
            d="M0 -11 L3.2 -3.6 L11 -3.2 L5 1.8 L7 9.6 L0 5.4 L-7 9.6 L-5 1.8 L-11 -3.2 L-3.2 -3.6 Z"
            fill="#f2c94c"
            stroke="#8f6e10"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
          <Glint x={-2.5} y={-3} size={2.6} />
        </g>
      ) : null}
      {charmId === "leaf-charm" ? (
        <g>
          <path
            d="M0 -12 C9 -6 9 6 0 12 C-9 6 -9 -6 0 -12 Z"
            fill="#9cb59a"
            stroke="#4f6f4d"
            strokeWidth={1.2}
          />
          <path d="M0 -10 L0 10 M0 -2 L4 -6 M0 4 L-4 0" stroke="#4f6f4d" strokeWidth={0.9} fill="none" />
        </g>
      ) : null}
      {charmId === "pearl-drop" ? (
        <g>
          <circle cx={0} cy={0} r={9} fill="#f6efe0" stroke="#b9ab90" strokeWidth={1.2} />
          <circle cx={-3} cy={-3} r={3.2} fill="#ffffff" opacity={0.9} />
          <circle cx={3} cy={4} r={4} fill="#e6dcc6" opacity={0.5} />
        </g>
      ) : null}
    </g>
  );
}
