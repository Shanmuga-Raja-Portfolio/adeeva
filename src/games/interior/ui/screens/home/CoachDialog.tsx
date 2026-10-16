import type { Point } from "../../../../../engine/geometry/point";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { CrewJob } from "../../../content/crew";
import { SITE_SAFETY_LINE } from "../../../content/hints";
import {
  COACH_TAPE,
  coachPattern,
  edgeTolerance,
  floorTolerance,
  paintById,
  type Action,
  type CoachRecord,
  type GameState,
  type Project,
} from "../../../core";
import { roomHex } from "../../art/roomHex";
import { useAssist } from "../../useAssist";
import { EdgeStrip } from "../makeover/EdgeStrip";
import { assistHint } from "../makeover/stageNames";
import "../makeover/paint.css";
import { CoachFloor } from "./CoachFloor";
import { CoachLight } from "./CoachLight";

interface CoachDialogProps {
  readonly state: GameState;
  readonly project: Project;
  readonly job: CrewJob | null;
  readonly dispatch: (action: Action) => boolean;
  readonly onClose: () => void;
}

const TITLES: Readonly<Record<CrewJob, string>> = {
  paint: "Show the crew how to edge",
  floor: "Show the crew how to lay the floor",
  light: "Show the crew where the lamp goes",
};

const LEADS: Readonly<Record<CrewJob, string>> = {
  paint: "Brush along one strip of tape. Your crew will copy your steady hand.",
  floor: "Lay three pieces on their shadows. Your crew will copy the pattern.",
  light: "Hang one lamp so both bean bags glow. Your crew will copy your eye for light.",
};

export function CoachDialog({ state, project, job, dispatch, onClose }: CoachDialogProps) {
  const toast = useToast();
  const [assistOn] = useAssist("paint");
  const finish = (record: CoachRecord): boolean => {
    if (!dispatch({ type: "coachCrew", record })) return false;
    toast("Your crew watched closely. They'll do it your way!");
    onClose();
    return true;
  };
  const paint = project.palette.paints[0];
  const colour = paint === undefined ? roomHex("sage") : roomHex(paintById(paint).colour);
  return (
    <Dialog
      open={job !== null}
      title={job === null ? "" : TITLES[job]}
      onClose={onClose}
      className="ad-dialog--wide"
    >
      <div className="is-crew-coach" data-testid={`coach-dialog-${job}`}>
        <p>{job === null ? null : LEADS[job]}</p>
        {job === "paint" ? (
          <>
            <EdgeStrip
              path={COACH_TAPE}
              done={false}
              colour={colour}
              tolerance={edgeTolerance(state)}
              onFinish={(samples: readonly Point[]) => finish({ job: "paint", samples })}
            />
            {assistOn ? (
              <Button
                variant="secondary"
                icon="sparkle"
                onClick={() => finish({ job: "paint", samples: [], assisted: true })}
                data-testid="coach-assist-paint"
              >
                Brush it for me
              </Button>
            ) : (
              <p className="is-hint">{assistHint("Steady brush", state)}</p>
            )}
          </>
        ) : null}
        {job === "floor" ? (
          <CoachFloor
            pattern={coachPattern(project)}
            tolerance={floorTolerance(state)}
            onDone={(drops) => finish({ job: "floor", drops })}
          />
        ) : null}
        {job === "light" ? <CoachLight onDone={(col, row) => finish({ job: "light", col, row })} /> : null}
        <p className="is-safety">
          <Icon name="shield" size={14} /> {SITE_SAFETY_LINE}
        </p>
      </div>
    </Dialog>
  );
}
