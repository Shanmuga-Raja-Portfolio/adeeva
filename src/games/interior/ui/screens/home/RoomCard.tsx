import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { CREW_JOBS, type CrewJob } from "../../../content/crew";
import {
  assignCrewIssue,
  crewById,
  crewWage,
  isRoomReady,
  openHomeRoomIssue,
  plotById,
  purposeById,
  roomById,
  workSkill,
  type GameState,
  type MakeoverRun,
  type Project,
  type Action,
} from "../../../core";
import { cutawayFrame } from "../../art/cutawayFrame";
import { MovingBoxes } from "../../art/MovingBoxes";
import { RoomCutaway } from "../../art/RoomCutaway";
import { BARE, FINISHED, roomLook } from "../../art/roomLook";

interface RoomCardProps {
  readonly state: GameState;
  readonly project: Project;
  readonly index: number;
  readonly dispatch: (action: Action) => boolean;
  readonly onOpen: () => void;
}

const STAGE_WORDS: Readonly<Record<MakeoverRun["stage"], string>> = {
  brief: "Not started",
  plan: "Planning",
  shop: "Shopping",
  paint: "Ready to paint",
  floor: "Ready for the floor",
  light: "Ready for lights",
  style: "Ready to style",
  reveal: "Ready for visitors",
  done: "Ready for visitors",
};

const JOB_VERBS: Readonly<Record<CrewJob, string>> = {
  paint: "paints",
  floor: "lays the floor",
  light: "hangs the lights",
};

export function RoomCard({ state, project, index, dispatch, onOpen }: RoomCardProps) {
  const once = useDispatchOnce(state, dispatch);
  const purposeId = project.map.spaces[index] ?? "hall";
  const purpose = purposeById(purposeId);
  const space = plotById(project.plotId).spaces[index] ?? { roomId: "living-room" as const };
  const run = project.rooms[index] ?? null;
  const open =
    state.activeRun !== null &&
    state.activeRun.purpose.kind === "home-room" &&
    state.activeRun.purpose.roomIndex === index
      ? state.activeRun
      : null;
  const shown = open ?? run;
  const ready = isRoomReady(run);
  const job = project.crewJobs.find((entry) => entry.roomIndex === index);
  const issue = openHomeRoomIssue(state, index);
  const larkspur = state.larkspur;
  const nextJob: CrewJob | null =
    run === null ? null : (CREW_JOBS.find((entry) => entry === run.stage) ?? null);
  return (
    <article
      className={ready ? "is-room-card is-room-card--ready" : "is-room-card"}
      data-testid={`room-card-${index}`}
    >
      <header className="is-room-card__head">
        <span className="ad-eyebrow">Space {index + 1}</span>
        <h3>{purpose.name}</h3>
        <span className={ready ? "is-room-card__stage is-room-card__stage--ready" : "is-room-card__stage"}>
          {ready ? <Icon name="check" size={14} /> : null}{" "}
          {shown === null ? "Not started" : STAGE_WORDS[shown.stage]}
        </span>
      </header>
      {shown === null ? (
        <div className="is-room-card__waiting">
          <RoomCutaway
            look={{
              roomId: space.roomId,
              backWall: null,
              backLower: null,
              sideWall: null,
              floor: null,
              pieces: [],
              soft: "#e9c7b8",
              lights: [],
              decor: [],
            }}
            title={`${purpose.name}, empty and waiting`}
            className="is-room-card__cutaway"
          >
            <MovingBoxes frame={cutawayFrame(roomById(space.roomId))} />
          </RoomCutaway>
          <span className="is-room-card__tag">Empty and waiting</span>
        </div>
      ) : (
        <RoomCutaway
          look={roomLook(shown, ready ? FINISHED : BARE)}
          title={`${purpose.name}, ${ready ? "ready" : "in progress"}`}
          className="is-room-card__cutaway"
        />
      )}
      {job !== undefined ? (
        <p className="is-room-card__crew" data-testid={`crew-job-${index}`}>
          <Icon name="sparkle" size={16} /> {crewById(job.crewId).name.split(" ")[0]} {JOB_VERBS[job.job]}{" "}
          tonight.
        </p>
      ) : null}
      {ready ? (
        <p className="is-room-card__done">
          <Icon name="check" size={18} /> Ready for the Open House
        </p>
      ) : null}
      {open !== null ? (
        <Button block icon="back" onClick={onOpen} data-testid={`open-room-${index}`}>
          Carry on here
        </Button>
      ) : !ready ? (
        <Button
          block
          icon={run === null ? "sparkle" : "back"}
          disabledReason={issue ?? undefined}
          onClick={(event) => {
            if (once(event, { type: "openHomeRoom", roomIndex: index })) onOpen();
          }}
          data-testid={`open-room-${index}`}
        >
          {run === null ? "Start this room" : "Carry on here"}
        </Button>
      ) : null}
      {nextJob !== null && job === undefined && larkspur !== null && larkspur.crew.hired.length > 0 ? (
        <div className="is-room-card__assign" aria-label={`Crew for the ${nextJob} step`}>
          {larkspur.crew.hired.map((crewId) => {
            const reason = assignCrewIssue(state, crewId, index, nextJob);
            const skill = Math.round(100 * workSkill(state, larkspur.crew, project, crewId, nextJob));
            return (
              <Button
                key={crewId}
                size="sm"
                variant="secondary"
                disabledReason={reason ?? undefined}
                onClick={(event) =>
                  once(event, { type: "assignCrew", crewId, roomIndex: index, job: nextJob })
                }
                data-testid={`assign-${crewId}-${index}`}
              >
                {crewById(crewId).name.split(" ")[0]} {JOB_VERBS[nextJob]} · {skill}% ·{" "}
                <Icon name="coin" size={12} />
                {crewWage(state, crewId)}
              </Button>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}
