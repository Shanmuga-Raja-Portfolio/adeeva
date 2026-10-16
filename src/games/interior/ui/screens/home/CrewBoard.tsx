import { useRef, useState } from "react";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { Meter } from "../../../../../ui/kit/Meter";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { CREW, CREW_JOBS, type CrewJob } from "../../../content/crew";
import { HOME_HINTS, SITE_SAFETY_LINE } from "../../../content/hints";
import {
  coachHours,
  coachIssue,
  crewCap,
  crewWage,
  finishCrewIssue,
  hireCrewIssue,
  workSkill,
  type Action,
  type GameState,
  type Larkspur,
  type Project,
} from "../../../core";
import { CoachDialog } from "./CoachDialog";

interface CrewBoardProps {
  readonly state: GameState;
  readonly larkspur: Larkspur;
  readonly project: Project;
  readonly dispatch: (action: Action) => boolean;
}

const JOB_NAMES: Readonly<Record<CrewJob, string>> = { paint: "Paint", floor: "Floor", light: "Light" };

export function CrewBoard({ state, larkspur, project, dispatch }: CrewBoardProps) {
  const once = useDispatchOnce(state, dispatch);
  const [coaching, setCoaching] = useState<CrewJob | null>(null);
  const coachRef = useRef<HTMLDivElement>(null);
  const coachHeading = useRef<HTMLHeadingElement>(null);
  const closeCoaching = () => {
    const job = coaching;
    setCoaching(null);
    window.requestAnimationFrame(() => {
      const button = coachRef.current?.querySelector<HTMLButtonElement>(`[data-testid="coach-${job ?? ""}"]`);
      if (button !== null && button !== undefined && !button.disabled) button.focus();
      else coachHeading.current?.focus();
    });
  };
  const hired = CREW.filter((member) => larkspur.crew.hired.includes(member.id));
  const others = CREW.filter((member) => !larkspur.crew.hired.includes(member.id));
  return (
    <section className="is-crew" aria-labelledby="is-crew-title" data-testid="crew-board">
      <header>
        <span className="ad-eyebrow">
          Your crew · {hired.length} of {crewCap(state)}
        </span>
        <h2 id="is-crew-title">The crew board</h2>
        <p className="is-muted">{HOME_HINTS.crewBoard}</p>
      </header>
      <ul className="is-crew__list">
        {hired.map((member) => {
          const busy = project.crewJobs.find((job) => job.crewId === member.id);
          return (
            <li key={member.id} className="is-crew__member" data-testid={`crew-${member.id}`}>
              <Avatar look={member.look} mood="happy" size={64} title={member.name} frameColour="#dbe7f5" />
              <div className="is-crew__body">
                <strong>{member.name}</strong>
                <span className="is-muted">
                  {member.speciality} · <Icon name="coin" size={12} /> {crewWage(state, member.id)} a job
                </span>
                {CREW_JOBS.map((job) => (
                  <Meter
                    key={job}
                    label={JOB_NAMES[job]}
                    value={Math.round(100 * workSkill(state, larkspur.crew, project, member.id, job))}
                    tone="sage"
                    valueText={`${Math.round(100 * workSkill(state, larkspur.crew, project, member.id, job))}%`}
                  />
                ))}
                {busy !== undefined ? (
                  <span className="is-crew__busy">
                    <Icon name="clock" size={14} /> On a job today
                  </span>
                ) : null}
              </div>
              <Button
                size="sm"
                variant="ghost"
                disabledReason={finishCrewIssue(state, member.id) ?? undefined}
                onClick={(event) => once(event, { type: "finishCrew", crewId: member.id })}
              >
                Finish working together
              </Button>
            </li>
          );
        })}
      </ul>
      {others.length > 0 ? (
        <>
          <h3 className="is-tray__heading">Bellwind recommends</h3>
          <ul className="is-crew__hire">
            {others.map((member) => (
              <li key={member.id}>
                <Avatar look={member.look} mood="happy" size={48} title={member.name} frameColour="#fcefc2" />
                <span>
                  <strong>{member.name}</strong>
                  <span className="is-muted">
                    {member.speciality} · {crewWage(state, member.id)} a job
                  </span>
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  disabledReason={hireCrewIssue(state, member.id) ?? undefined}
                  onClick={(event) => once(event, { type: "hireCrew", crewId: member.id })}
                  data-testid={`hire-${member.id}`}
                >
                  Hire
                </Button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <h3 className="is-tray__heading" ref={coachHeading} tabIndex={-1}>
        Show the crew how
      </h3>
      <p className="is-muted">{HOME_HINTS.coaching}</p>
      <div className="is-crew__coach" ref={coachRef}>
        {CREW_JOBS.map((job) => {
          const demo = project.coached[job];
          return (
            <Button
              key={job}
              size="sm"
              variant={demo === undefined ? "secondary" : "ghost"}
              disabledReason={demo === undefined ? (coachIssue(state, job) ?? undefined) : "Shown already"}
              onClick={() => setCoaching(job)}
              data-testid={`coach-${job}`}
            >
              {demo === undefined
                ? `${JOB_NAMES[job]} · ${coachHours(state)} h`
                : `${JOB_NAMES[job]} ✓ ${Math.round(demo * 100)}%`}
            </Button>
          );
        })}
      </div>
      <p className="is-safety">
        <Icon name="shield" size={14} /> {SITE_SAFETY_LINE}
      </p>
      <CoachDialog
        state={state}
        project={project}
        job={coaching}
        dispatch={dispatch}
        onClose={closeCoaching}
      />
    </section>
  );
}
