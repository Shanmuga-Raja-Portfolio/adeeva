import { canGoBack, type Action, type DressRun, type GameState } from "../../../core";
import { Icon } from "../../../../../ui/kit/IconSet";
import { CRAFT_STAGES, STAGE_LABELS } from "./stageNames";

export interface StageRailProps {
  readonly state: GameState;
  readonly run: DressRun;
  readonly dispatch: (action: Action) => void;
}

export function StageRail({ state, run, dispatch }: StageRailProps) {
  const currentIndex = CRAFT_STAGES.findIndex((stage) => stage === run.stage);
  return (
    <nav className="ad-stage-rail ad-step-rail" aria-label="Dressmaking steps">
      <ol>
        {CRAFT_STAGES.map((stage, index) => {
          const done = index < currentIndex;
          const current = index === currentIndex;
          const back = done ? canGoBack(state, stage) : null;
          const status = current ? "current" : done ? "done" : "upcoming";
          const content = (
            <>
              <span className="ad-stage-rail__dot" aria-hidden="true">
                {done ? <Icon name="check" size={16} /> : index + 1}
              </span>
              <span className="ad-stage-rail__label">{STAGE_LABELS[stage]}</span>
            </>
          );
          return (
            <li key={stage} className={`ad-stage-rail__step ad-stage-rail__step--${status}`}>
              {back !== null && back.ok ? (
                <button
                  type="button"
                  className="ad-stage-rail__button"
                  onClick={() => dispatch({ type: "goToStage", stage })}
                  aria-label={`Go back to ${STAGE_LABELS[stage]}`}
                >
                  {content}
                </button>
              ) : (
                <span
                  className="ad-stage-rail__button"
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
