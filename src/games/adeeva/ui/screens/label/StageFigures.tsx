import type { ReactNode } from "react";
import { dressGarment } from "../../art/avatarDress";
import type { AvatarLook } from "../../../../../engine/avatar";
import { AvatarFigure } from "../../../../../ui/art/avatar/Avatar";
import { DOLL_VIEWBOX } from "../../../../../ui/art/avatar/Croquis";
import { RUNWAY_VIEW, runwayDepth } from "../../art/runwayGeometry";
import { AudienceCheer } from "./AudienceCheer";
import { PetalFall } from "../../../../../ui/art/PetalFall";
import type { ShowWalker } from "./showCast";
import type { StageFigure, StageShot } from "./stageShot";
import { walkerFrame } from "../../art/runwayWalker";

export interface CarriedWalker {
  readonly look: AvatarLook;
  readonly art: ReactNode;
}

interface FiguresBase {
  readonly sceneT: number;
  readonly designer: AvatarLook;
  readonly hearts: string;
  readonly petalColours: readonly string[];
  readonly className?: string | undefined;
}

export type StageFiguresProps<W> = FiguresBase &
  (
    | { readonly shot: StageShot; readonly carry?: undefined }
    | { readonly shot: StageShot<W>; readonly carry: (walker: W) => CarriedWalker }
  );

interface PlacedPerson {
  readonly figure: StageFigure<unknown>;
  readonly body: ReactNode;
  readonly carried: ReactNode;
}

function dressedPeople(shot: StageShot, designer: AvatarLook): PlacedPerson[] {
  return shot.figures.map((entry: StageFigure<ShowWalker>) => ({
    figure: entry,
    body:
      entry.walker === null ? (
        <AvatarFigure look={designer} mood="delighted" />
      ) : (
        <AvatarFigure look={entry.walker.model} garment={dressGarment(entry.walker.dress)} mood="neutral" />
      ),
    carried: null,
  }));
}

function carryingPeople<W>(
  shot: StageShot<W>,
  designer: AvatarLook,
  carry: (walker: W) => CarriedWalker,
): PlacedPerson[] {
  return shot.figures.map((entry) => {
    const carried = entry.walker === null ? null : carry(entry.walker);
    return {
      figure: entry,
      body: <AvatarFigure look={carried?.look ?? designer} mood={carried === null ? "delighted" : "happy"} />,
      carried: carried?.art ?? null,
    };
  });
}

export function StageFigures<W>(props: StageFiguresProps<W>) {
  const { sceneT, designer, hearts, petalColours, className } = props;
  const people =
    props.carry === undefined
      ? dressedPeople(props.shot, designer)
      : carryingPeople(props.shot, designer, props.carry);
  const ordered = [...people].sort((a, b) => runwayDepth(a.figure.progress) - runwayDepth(b.figure.progress));
  const { shot } = props;
  return (
    <svg
      className={className ?? "ad-show__figures"}
      viewBox={`0 0 ${RUNWAY_VIEW.width} ${RUNWAY_VIEW.height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {ordered.map(({ figure: entry, body, carried }) => {
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
                {body}
                {carried}
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
