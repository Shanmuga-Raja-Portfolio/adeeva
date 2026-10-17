import type { AvatarLook } from "../../../../engine/avatar";
import type { AvatarGarment } from "../../../../ui/art/avatar/Avatar";
import { useSvgId } from "../../../../ui/art/useSvgId";
import { CUISINE_IDS, type CuisineId } from "../../content/cuisine";
import { SceneFigure } from "./SceneFigure";
import { SchoolCorridor } from "./SchoolCorridor";

export const SCHOOL_VIEWBOX = "40 92 1120 580";

const FLOOR = 560;
const DOORWAY = 447;
const NEAR = 0.385;
const FAR = 0.29;
const MATE_FEET = 532;
const MATE = 0.335;

const CLASSMATE: AvatarLook = {
  skinTone: "espresso",
  hairStyle: "curly-puff",
  hairColour: "black",
  outfit: "dungarees",
};

export interface SchoolGuide {
  readonly look: AvatarLook;
  readonly garment: AvatarGarment;
}

export interface SchoolSceneProps {
  readonly player: AvatarLook;
  readonly today: CuisineId | undefined;
  readonly guide: SchoolGuide | null;
  readonly className?: string | undefined;
}

function doorX(cuisine: CuisineId): number {
  return 600 + (180 + CUISINE_IDS.indexOf(cuisine) * 168 - 600) * 0.92;
}

const LAST_GAP = CUISINE_IDS.length - 2;

function gapX(gap: number): number {
  return 600 + (264 + gap * 168 - 600) * 0.92;
}

function nearestGap(x: number): number {
  return Math.min(LAST_GAP, Math.max(0, Math.round(((x - 600) / 0.92 + 336) / 168)));
}

function mateGap(gap: number, side: 1 | -1): number {
  const next = gap + side;
  return next < 0 || next > LAST_GAP ? gap - side : next;
}

export function SchoolScene({ player, today, guide, className }: SchoolSceneProps) {
  const id = useSvgId("ck-school");
  const door = today === undefined ? 600 : doorX(today);
  const side: 1 | -1 = door < 600 ? 1 : -1;
  const gap = nearestGap(guide === null ? 600 : door + side * 440);
  const playerX = gapX(gap);
  const mateX = gapX(mateGap(gap, side));
  return (
    <svg
      viewBox={SCHOOL_VIEWBOX}
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${id}-warm`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe2a0" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffe2a0" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#1d1208" stopOpacity={0} />
          <stop offset="1" stopColor="#1d1208" stopOpacity={0.5} />
        </radialGradient>
      </defs>
      <SchoolCorridor today={today} />
      <ellipse cx={(door + playerX) / 2} cy={430} rx={320} ry={230} fill={`url(#${id}-warm)`} />
      <SceneFigure
        x={mateX}
        feet={MATE_FEET}
        scale={MATE}
        facing={side === 1 ? -1 : 1}
        look={CLASSMATE}
        pose="chat"
        lean={-2}
        mood="happy"
        className="ck-school__classmate"
      />
      {guide === null ? null : (
        <SceneFigure
          x={door}
          feet={DOORWAY}
          scale={FAR}
          facing={side}
          look={guide.look}
          garment={guide.garment}
          pose="present"
          lean={2}
          mood="happy"
          className="ck-school__mentor"
        />
      )}
      <SceneFigure
        x={playerX}
        feet={FLOOR}
        scale={NEAR}
        facing={side === 1 ? -1 : 1}
        look={player}
        pose={guide === null ? "wave" : "cheer"}
        lean={3}
        className="ck-school__player"
      />
      <rect x={-20} y={0} width={1240} height={760} fill={`url(#${id}-vignette)`} />
    </svg>
  );
}
