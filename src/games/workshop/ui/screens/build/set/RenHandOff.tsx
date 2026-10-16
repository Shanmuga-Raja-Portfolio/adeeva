import { useEffect, useState } from "react";
import { Button } from "../../../../../../ui/kit/Button";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../../ui/kit/useDispatchOnce";
import { APPRENTICE_JOBS, REN, type ApprenticeJobId } from "../../../../content/apprentice";
import { REN_SAFETY_LINE } from "../../../../content/hint";
import { apprenticeJobCheck, renAccuracy, renJobsPerDay } from "../../../../core";
import { WorkshopAvatar } from "../../../art/WorkshopAvatar";
import type { StageProps } from "../stageProps";

const SCENE_MS = 2000;

export interface RenHandOffProps extends StageProps {
  readonly job: ApprenticeJobId;
}

function RenScene({ job }: { readonly job: ApprenticeJobId }) {
  return (
    <div className={`ww-ren-scene ww-ren-scene--${job}`} role="status" data-testid="ren-scene">
      <WorkshopAvatar look={REN.look} mood="delighted" title={REN.name} className="ww-ren-scene__ren" />
      <svg className="ww-ren-scene__fx" viewBox="-60 -60 120 120" aria-hidden="true">
        {job === "pegs" ? (
          <g className="ww-ren-scene__mallet">
            <rect
              x={-6}
              y={-4}
              width={12}
              height={46}
              rx={4}
              fill="#a4764b"
              stroke="#2f2622"
              strokeWidth={3}
            />
            <rect
              x={-26}
              y={-26}
              width={52}
              height={26}
              rx={8}
              fill="#f2c230"
              stroke="#2f2622"
              strokeWidth={3}
            />
          </g>
        ) : (
          <g className="ww-ren-scene__dust" fill="#f3e3c8" stroke="#c58a4a" strokeWidth={2}>
            <circle cx={-20} cy={6} r={14} />
            <circle cx={8} cy={-10} r={18} />
            <circle cx={22} cy={14} r={12} />
          </g>
        )}
      </svg>
      <p>
        {job === "fetch"
          ? "Ren is off to Pell's yard!"
          : job === "sand"
            ? "Swish, swish! Ren is sanding."
            : "Tock, tock! Ren taps the pegs home."}
      </p>
    </div>
  );
}

export function RenHandOff({ state, dispatch, job }: RenHandOffProps) {
  const once = useDispatchOnce(state, dispatch);
  const [scene, setScene] = useState(false);
  useEffect(() => {
    if (!scene) return;
    const timer = window.setTimeout(() => setScene(false), SCENE_MS);
    return () => window.clearTimeout(timer);
  }, [scene]);
  const apprentice = state.apprentice;
  if (state.career !== "showroom" || apprentice === null) return null;
  const def = APPRENTICE_JOBS.find((entry) => entry.id === job);
  if (def === undefined) return null;
  const check = apprenticeJobCheck(state, job);
  const left = renJobsPerDay(state) - apprentice.jobsToday;
  return (
    <section className="ww-ren-card ww-paper" aria-label="Hand a job to Ren">
      <div className="ww-ren-card__who" aria-hidden="true">
        <WorkshopAvatar look={REN.look} title={REN.name} className="ww-ren-card__avatar" />
      </div>
      <div className="ww-ren-card__body">
        <span className="ad-eyebrow">
          Ren · {Math.round(renAccuracy(apprentice.jobsDone) * 100)}% steady · {Math.max(0, left)}{" "}
          {left === 1 ? "job" : "jobs"} left today
        </span>
        <strong>{def.name}</strong>
        <span className="ww-muted">{def.blurb}</span>
        <span className="ww-safety">
          <Icon name="shield" size={14} /> {REN_SAFETY_LINE}
        </span>
      </div>
      <Button
        className="ww-big-button"
        icon="heart"
        onClick={(event) => {
          if (once(event, { type: "handToRen", job })) setScene(true);
        }}
        disabledReason={
          apprentice.hired ? (check.ok ? undefined : check.reasons[0]) : "Take Ren on in the showroom first."
        }
        showReason
        data-testid={`ren-${job}`}
      >
        Hand this to Ren
      </Button>
      {scene ? <RenScene job={job} /> : null}
    </section>
  );
}
