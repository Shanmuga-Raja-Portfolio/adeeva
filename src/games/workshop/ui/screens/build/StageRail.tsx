import { Icon } from "../../../../../ui/kit/IconSet";
import { RUN_STAGES, type RunStage } from "../../../content/runStage";
import { canGoBack } from "../../../core";
import { STAGE_LABELS } from "./stageNames";
import type { StageProps } from "./stageProps";

const RAIL_STAGES: readonly RunStage[] = RUN_STAGES.filter((stage) => stage !== "done");

export function StageRail({ state, run, dispatch }: Omit<StageProps, "onExit">) {
  const current = RAIL_STAGES.indexOf(run.stage);
  return (
    <nav className="ww-rail ad-step-rail" aria-label="Building steps">
      <ol>
        {RAIL_STAGES.map((stage, index) => {
          const done = index < current;
          const back = done ? canGoBack(state, stage) : null;
          const status = index === current ? "current" : done ? "done" : "upcoming";
          const content = (
            <>
              <span className="ww-rail__dot" aria-hidden="true">
                {done ? <Icon name="check" size={14} /> : index + 1}
              </span>
              <span className="ww-rail__label">{STAGE_LABELS[stage]}</span>
            </>
          );
          return (
            <li key={stage} className={`ww-rail__step ww-rail__step--${status}`}>
              {back !== null && back.ok ? (
                <button
                  type="button"
                  className="ww-rail__button"
                  onClick={() => dispatch({ type: "goToStage", stage })}
                  aria-label={`Go back to ${STAGE_LABELS[stage]}`}
                >
                  {content}
                </button>
              ) : (
                <span
                  className="ww-rail__button"
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
