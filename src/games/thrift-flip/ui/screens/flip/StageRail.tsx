import { Icon } from "../../../../../ui/kit/IconSet";
import { canGoBack, type Action, type FlipRun, type GameState } from "../../../core";
import { craftStages, STAGE_LABELS } from "./stageNames";
import "./rail.css";

export interface StageRailProps {
  readonly state: GameState;
  readonly run: FlipRun;
  readonly dispatch: (action: Action) => boolean;
}

export function StageRail({ state, run, dispatch }: StageRailProps) {
  const stages = craftStages(run);
  const currentIndex = stages.findIndex((stage) => stage === run.stage);
  return (
    <nav className="tf-rail ad-step-rail" aria-label="Flip steps">
      <ol>
        {stages.map((stage, index) => {
          const done = index < currentIndex;
          const current = index === currentIndex;
          const back = done ? canGoBack(state, stage) : null;
          const status = current ? "current" : done ? "done" : "upcoming";
          const content = (
            <>
              <span className="tf-rail__dot" aria-hidden="true">
                {done ? <Icon name="check" size={14} /> : current ? index + 1 : null}
              </span>
              <span className="tf-rail__label">{STAGE_LABELS[stage]}</span>
            </>
          );
          return (
            <li key={stage} className={`tf-rail__step tf-rail__step--${status}`}>
              {back !== null && back.ok ? (
                <button
                  type="button"
                  className="tf-rail__button"
                  onClick={() => dispatch({ type: "goToStage", stage })}
                  aria-label={`Go back to ${STAGE_LABELS[stage]}`}
                >
                  {content}
                </button>
              ) : (
                <span
                  className="tf-rail__button"
                  aria-current={current ? "step" : undefined}
                  title={back !== null ? back.reasons[0] : undefined}
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
