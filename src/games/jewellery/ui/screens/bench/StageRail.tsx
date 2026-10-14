import { Icon } from "../../../../../ui/kit/IconSet";
import { canGoBack, runStages, type RunStage } from "../../../core";
import { STAGE_LABELS } from "./stageNames";
import type { StageProps } from "./stageProps";

export function StageRail({ state, run, dispatch }: Omit<StageProps, "onExit">) {
  const stages: readonly RunStage[] = runStages(run).filter((stage) => stage !== "done");
  const current = stages.indexOf(run.stage);
  return (
    <nav className="jb-rail" aria-label="Making steps">
      <ol>
        {stages.map((stage, index) => {
          const done = index < current;
          const back = done ? canGoBack(state, stage) : null;
          const status = index === current ? "current" : done ? "done" : "upcoming";
          const content = (
            <>
              <span className="jb-rail__dot" aria-hidden="true">
                {done ? <Icon name="check" size={14} /> : index + 1}
              </span>
              <span className="jb-rail__label">{STAGE_LABELS[stage]}</span>
            </>
          );
          return (
            <li key={stage} className={`jb-rail__step jb-rail__step--${status}`}>
              {back !== null && back.ok ? (
                <button
                  type="button"
                  className="jb-rail__button"
                  onClick={() => dispatch({ type: "goToStage", stage })}
                  aria-label={`Go back to ${STAGE_LABELS[stage]}`}
                >
                  {content}
                </button>
              ) : (
                <span
                  className="jb-rail__button"
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
