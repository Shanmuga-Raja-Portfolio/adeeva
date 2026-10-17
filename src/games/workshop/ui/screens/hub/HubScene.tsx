import { DOLL_VIEWBOX } from "../../../../../ui/art/avatar/Croquis";
import { AvatarFigure } from "../../../../../ui/art/avatar/Avatar";
import type { AvatarPose } from "../../../../../ui/art/avatar/ArmPose";
import type { AvatarLook } from "../../../../../engine/avatar";
import { REN } from "../../../content/apprentice";
import { dayHours, type GameState } from "../../../core";
import { GarageBackdrop } from "../../art/GarageBackdrop";
import { pieceLook } from "../../art/pieceLook";
import { PiecePreview } from "../../art/PiecePreview";
import { ShowroomBackdrop } from "../../art/ShowroomBackdrop";
import { WorkshopApron } from "../../art/WorkshopAvatar";

export interface HubSceneProps {
  readonly state: GameState;
  readonly evening: boolean;
}

interface Spot {
  readonly x: number;
  readonly feet: number;
  readonly height: number;
}

function Figure({ look, pose, spot }: { look: AvatarLook; pose: AvatarPose; spot: Spot }) {
  const width = spot.height / 2;
  return (
    <svg
      x={spot.x - width / 2}
      y={spot.feet - spot.height * 0.975}
      width={width}
      height={spot.height}
      viewBox={DOLL_VIEWBOX}
      className="ww-scene-figure"
    >
      <ellipse cx={200} cy={786} rx={92} ry={14} fill="#2f2622" opacity={0.22} />
      <AvatarFigure look={look} pose={pose} />
      <WorkshopApron />
    </svg>
  );
}

const GARAGE_YOU: Spot = { x: 520, feet: 664, height: 400 };
const GARAGE_REN: Spot = { x: 1000, feet: 650, height: 340 };
const SHOWROOM_YOU: Spot = { x: 170, feet: 676, height: 320 };
const SHOWROOM_REN: Spot = { x: 1110, feet: 668, height: 290 };

export function HubScene({ state, evening }: HubSceneProps) {
  const run = state.activeRun;
  const look = run !== null && run.stage !== "done" ? pieceLook(run) : null;
  const renHere = state.apprentice?.hired === true;
  const hour = 8 + dayHours(state) - state.calendar.hoursLeft;
  if (state.career === "showroom") {
    return (
      <ShowroomBackdrop
        className="ww-hero__backdrop"
        decor={state.decor}
        floor={state.showroom?.floor ?? []}
        rail={state.fair?.rosetteRail ?? {}}
        evening={evening}
        floorFocus
        plaques
      >
        {renHere ? <Figure look={REN.look} pose="chat" spot={SHOWROOM_REN} /> : null}
        <Figure look={state.profile.look} pose="present" spot={SHOWROOM_YOU} />
      </ShowroomBackdrop>
    );
  }
  return (
    <GarageBackdrop className="ww-hero__backdrop" decor={state.decor} evening={evening} hour={hour} lively>
      {look !== null ? (
        <svg x={600} y={188} width={376} height={282} viewBox="0 0 400 300">
          <PiecePreview look={look} title={null} />
        </svg>
      ) : null}
      {renHere ? <Figure look={REN.look} pose="chat" spot={GARAGE_REN} /> : null}
      <Figure look={state.profile.look} pose={look === null ? "wave" : "present"} spot={GARAGE_YOU} />
    </GarageBackdrop>
  );
}
