import { Icon } from "../../../../../ui/kit/IconSet";
import { canGoBack, runKind, stagesFor, type RunStage } from "../../../core";
import { STAGE_LABELS } from "./stageNames";
import type { StageProps } from "./stageProps";

export function StageRail({ state, run, dispatch }: Omit<StageProps, "onExit">) {
  const stages: readonly RunStage[] = stagesFor(runKind(run)).filter((stage) => stage !== "done");
  const current = stages.indexOf(run.stage);
  return (
    <nav className="pa-rail ad-step-rail" aria-label="Baking steps">
      <ol>
        {stages.map((stage, index) => {
          const done = index < current;
          const back = done ? canGoBack(state, stage) : null;
          const status = index === current ? "current" : done ? "done" : "upcoming";
          const content = (
            <>
              <span className="pa-rail__dot" aria-hidden="true">
                {done ? <Icon name="check" size={14} /> : index + 1}
              </span>
              <span className={done ? "pa-rail__label ad-visually-hidden" : "pa-rail__label"}>
                {STAGE_LABELS[stage]}
              </span>
            </>
          );
          return (
            <li key={stage} className={`pa-rail__step pa-rail__step--${status}`}>
              {back !== null && back.ok ? (
                <button
                  type="button"
                  className="pa-rail__button"
                  onClick={() => dispatch({ type: "goToStage", stage })}
                  aria-label={`Go back to ${STAGE_LABELS[stage]}`}
                >
                  {content}
                </button>
              ) : (
                <span
                  className="pa-rail__button"
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
