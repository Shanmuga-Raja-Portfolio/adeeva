import { FabricPattern, fabricFill, fabricSheenFill } from "../../../../../../ui/art/cloth/FabricPattern";
import { fabricLook } from "../../../../../../ui/art/cloth/fabricLook";
import { useSvgId } from "../../../../../../ui/art/useSvgId";
import { findById, type PanelBoard } from "../../../../core";
import { findCloth } from "../../../art/findCloth";

export interface PanelBoardArtProps {
  readonly board: PanelBoard;
}

export function PanelBoardArt({ board }: PanelBoardArtProps) {
  const id = useSvgId("panels");
  const findIds = [...new Set(board.panels.map((panel) => panel.findId))];
  return (
    <g className="tf-panels">
      <defs>
        {findIds.map((findId) => (
          <FabricPattern key={findId} id={`${id}-${findId}`} fabric={findCloth(findById(findId))} tile={8} />
        ))}
      </defs>
      {board.panels.map((panel) => {
        const look = fabricLook(findCloth(findById(panel.findId)));
        return (
          <g key={`${panel.findKey}-${panel.panel}`} data-panel={`${panel.findKey}-${panel.panel}`}>
            <rect
              x={panel.x + 0.6}
              y={panel.y + 0.9}
              width={panel.width}
              height={panel.height}
              fill="#3b2a1c"
              opacity={0.16}
              rx={0.6}
            />
            <rect
              x={panel.x}
              y={panel.y}
              width={panel.width}
              height={panel.height}
              fill={fabricFill(`${id}-${panel.findId}`)}
              rx={0.6}
            />
            <rect
              x={panel.x}
              y={panel.y}
              width={panel.width}
              height={panel.height}
              fill={fabricSheenFill(`${id}-${panel.findId}`)}
              rx={0.6}
            />
            <rect
              x={panel.x + 1}
              y={panel.y + 1}
              width={panel.width - 2}
              height={panel.height - 2}
              fill="none"
              stroke={look.stitch}
              strokeWidth={0.35}
              strokeDasharray="1.4 1"
              opacity={0.7}
            />
          </g>
        );
      })}
      {board.spots.map((spot, index) => {
        const [x, y] = spot.polygon[0] ?? [0, 0];
        return (
          <g key={index} className="tf-worn" data-worn-spot={index}>
            <rect x={x} y={y} width={12} height={12} rx={2.4} fill="#f5ecd8" opacity={0.72} />
            <rect
              x={x}
              y={y}
              width={12}
              height={12}
              rx={2.4}
              fill="none"
              stroke="#a0603a"
              strokeWidth={0.45}
              strokeDasharray="1 0.8"
            />
            <path
              d={`M${x + 3} ${y + 3} l6 6 M${x + 9} ${y + 3} l-6 6 M${x + 6} ${y + 2} l0 8`}
              stroke="#a0603a"
              strokeWidth={0.3}
              opacity={0.6}
            />
            <text x={x + 6} y={y + 14.6} textAnchor="middle" fontSize={2.4} fill="#7a4a2a" fontWeight={700}>
              worn
            </text>
          </g>
        );
      })}
    </g>
  );
}
