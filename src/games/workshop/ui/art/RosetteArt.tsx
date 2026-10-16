import { mixHex } from "../../../../ui/art/colourMix";
import type { RosetteId } from "../../content/rosette";
import { rosetteById } from "../../core";

const OUTLINE = "#2f2622";
const PETALS = 14;

export function RosetteArt({ rosetteId }: { readonly rosetteId: RosetteId }) {
  const rosette = rosetteById(rosetteId);
  const light = mixHex(rosette.colour, "#ffffff", 0.45);
  const ribbon = rosetteId === "makers-ribbon" || rosetteId === "merit";
  return (
    <g className="ww-rosette">
      <path
        d="M-18 20 L-30 76 L-16 66 L-6 78 L2 24 Z"
        fill={rosette.colour}
        stroke={OUTLINE}
        strokeWidth={3}
      />
      <path d="M18 20 L30 76 L16 66 L6 78 L-2 24 Z" fill={light} stroke={OUTLINE} strokeWidth={3} />
      {ribbon ? null : (
        <g>
          {Array.from({ length: PETALS }, (_, index) => {
            const angle = (index / PETALS) * 360;
            return (
              <ellipse
                key={index}
                cx={0}
                cy={-28}
                rx={9}
                ry={14}
                transform={`rotate(${angle})`}
                fill={index % 2 === 0 ? rosette.colour : light}
                stroke={OUTLINE}
                strokeWidth={2}
              />
            );
          })}
        </g>
      )}
      <circle r={ribbon ? 24 : 22} fill={ribbon ? rosette.colour : light} stroke={OUTLINE} strokeWidth={3} />
      <circle r={14} fill="#fffaf0" stroke={OUTLINE} strokeWidth={2} />
      {rosetteId === "oak-leaf" ? (
        <path d="M0 -9 Q8 -2 3 8 Q0 4 -3 8 Q-8 -2 0 -9 Z" fill="#3f6b4f" stroke={OUTLINE} strokeWidth={1.5} />
      ) : (
        <path
          d="M0 -8 L2.4 -2.4 L8 -2.4 L3.4 1.4 L5 7.4 L0 3.8 L-5 7.4 L-3.4 1.4 L-8 -2.4 L-2.4 -2.4 Z"
          fill={rosette.colour}
          stroke={OUTLINE}
          strokeWidth={1.2}
        />
      )}
    </g>
  );
}
