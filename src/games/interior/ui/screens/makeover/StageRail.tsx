import { Icon } from "../../../../../ui/kit/IconSet";
import { canGoBack, isHomeRoom, RUN_STAGES, type RunStage } from "../../../core";
import { STAGE_LABELS } from "./stageNames";
import type { StageProps } from "./stageProps";

export function StageRail({ state, run, dispatch }: Omit<StageProps, "onExit">) {
  const stages: readonly RunStage[] = RUN_STAGES.filter((stage) => stage !== "done");
  const current = stages.indexOf(run.stage);
  return (
    <nav className="is-rail ad-step-rail" aria-label="Makeover steps">
      <ol>
        {stages.map((stage, index) => {
          const done = index < current;
          const back = done ? canGoBack(state, stage) : null;
          const status = index === current ? "current" : done ? "done" : "upcoming";
          const content = (
            <>
              <span className="is-rail__dot" aria-hidden="true">
                {done ? <Icon name="check" size={14} /> : index + 1}
              </span>
              <span className="is-rail__label">
                {stage === "reveal" && isHomeRoom(run) ? "Ready" : STAGE_LABELS[stage]}
              </span>
            </>
          );
          return (
            <li key={stage} className={`is-rail__step is-rail__step--${status}`}>
              {back !== null && back.ok ? (
                <button
                  type="button"
                  className="is-rail__button"
                  onClick={() => dispatch({ type: "goToStage", stage })}
                  aria-label={`Go back to ${STAGE_LABELS[stage]}`}
                >
                  {content}
                </button>
              ) : (
                <span
                  className="is-rail__button"
                  aria-current={index === current ? "step" : undefined}
                  title={back?.reasons[0]}
                >
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
