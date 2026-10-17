import { Icon } from "../../../../../ui/kit/IconSet";
import {
  canGoBack,
  cookSteps,
  currentCookStep,
  dishById,
  stageIndex,
  type Action,
  type DishRun,
  type GameState,
  type RunStage,
} from "../../../core";
import { COOK_STEP_NAMES } from "./stageNames";

export interface StageRailProps {
  readonly state: GameState;
  readonly run: DishRun;
  readonly dispatch: (action: Action) => boolean;
}

interface RailStop {
  readonly key: string;
  readonly label: string;
  readonly stage: RunStage;
  readonly state: "done" | "current" | "todo";
}

function stops(run: DishRun): RailStop[] {
  const dish = dishById(run.dishId);
  const now = stageIndex(run.stage);
  const status = (stage: RunStage) =>
    stageIndex(stage) < now ? "done" : stageIndex(stage) === now ? "current" : "todo";
  const current = currentCookStep(run, dish);
  const steps = cookSteps(dish);
  return [
    { key: "ticket", label: "Ticket", stage: "ticket", state: status("ticket") },
    { key: "mise", label: "Get ready", stage: "mise", state: status("mise") },
    ...steps.map((kind): RailStop => {
      const cookState = status("cook");
      const own =
        cookState !== "current"
          ? cookState
          : current === kind
            ? "current"
            : steps.indexOf(kind) < (current === null ? steps.length : steps.indexOf(current))
              ? "done"
              : "todo";
      return { key: kind, label: COOK_STEP_NAMES[kind], stage: "cook", state: own };
    }),
    { key: "plate", label: "Plate", stage: "plate", state: status("plate") },
    { key: "pass", label: "Pass", stage: "pass", state: status("pass") },
  ];
}

export function StageRail({ state, run, dispatch }: StageRailProps) {
  return (
    <ol className="ck-rail" aria-label="Steps for this dish">
      {stops(run).map((stop, index) => {
        const back = canGoBack(state, stop.stage).ok && stop.stage !== run.stage;
        const dot = (
          <span className="ck-rail__dot">
            {stop.state === "done" ? <Icon name="check" size={14} /> : index + 1}
          </span>
        );
        const label = (
          <span className={stop.state === "current" ? "ck-rail__name" : "ad-visually-hidden"}>
            {stop.label}
          </span>
        );
        return (
          <li
            key={stop.key}
            className={`ck-rail__stop ck-rail__stop--${stop.state}`}
            aria-current={stop.state === "current" ? "step" : undefined}
            title={stop.label}
          >
            {back ? (
              <button
                type="button"
                className="ck-rail__mark ck-rail__back"
                onClick={() => dispatch({ type: "goToStage", stage: stop.stage })}
              >
                {dot}
                {label}
              </button>
            ) : (
              <span className="ck-rail__mark">
                {dot}
                {label}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
