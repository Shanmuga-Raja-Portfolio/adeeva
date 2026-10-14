import { dressGarment } from "../../art/avatarDress";
import type { AvatarLook } from "../../../../../engine/avatar";
import { AvatarFigure } from "../../../../../ui/art/avatar/Avatar";
import { DOLL_VIEWBOX } from "../../../../../ui/art/avatar/Croquis";
import { RUNWAY_VIEW, runwayDepth } from "../../art/runwayGeometry";
import { AudienceCheer } from "./AudienceCheer";
import { PetalFall } from "../../../../../ui/art/PetalFall";
import type { StageShot } from "./stageShot";
import { walkerFrame } from "../../art/runwayWalker";

export interface StageFiguresProps {
  shot: StageShot;
  sceneT: number;
  designer: AvatarLook;
  hearts: string;
  petalColours: readonly string[];
}

export function StageFigures({ shot, sceneT, designer, hearts, petalColours }: StageFiguresProps) {
  const ordered = [...shot.figures].sort((a, b) => runwayDepth(a.progress) - runwayDepth(b.progress));
  return (
    <svg
      className="ad-show__figures"
      viewBox={`0 0 ${RUNWAY_VIEW.width} ${RUNWAY_VIEW.height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {ordered.map((entry) => {
        if (entry.opacity <= 0) return null;
        const frame = walkerFrame(entry.progress, entry.lateral, entry.stride);
        const spin = Math.abs(entry.spin) < 0.16 ? 0.16 * Math.sign(entry.spin || 1) : entry.spin;
        const dip = entry.dip;
        const transform = `translate(200 772) scale(${spin.toFixed(3)} ${(1 - 0.1 * dip).toFixed(3)}) translate(-200 -772)`;
        return (
          <g key={entry.key} opacity={entry.opacity}>
            <ellipse
              cx={frame.centre}
              cy={frame.feet}
              rx={frame.width * 0.3}
              ry={frame.width * 0.055}
              fill="#000000"
              opacity={0.4}
            />
            <svg
              x={frame.x}
              y={frame.y}
              width={frame.width}
              height={frame.height}
              viewBox={DOLL_VIEWBOX}
              overflow="visible"
            >
              <g transform={transform}>
                {entry.walker !== null ? (
                  <AvatarFigure
                    look={entry.walker.model}
                    garment={dressGarment(entry.walker.dress)}
                    mood="neutral"
                  />
                ) : (
                  <AvatarFigure look={designer} mood="delighted" />
                )}
              </g>
            </svg>
          </g>
        );
      })}
      {shot.cheer > 0 ? (
        <AudienceCheer intensity={shot.cheer} t={sceneT} seed={shot.cheerSeed} heart={hearts} />
      ) : null}
      {shot.petals >= 0 ? <PetalFall t={shot.petals} colours={petalColours} /> : null}
    </svg>
  );
}
