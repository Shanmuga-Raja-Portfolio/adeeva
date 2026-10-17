import { Icon } from "../../../../../ui/kit/IconSet";
import { cookSteps, currentCookStep, dishById, runAccuracies, type DishRun } from "../../../core";
import { COOK_STEP_NAMES } from "./stageNames";

function Sparkle() {
  return (
    <svg viewBox="0 0 40 40" className="ck-step-sparkle" aria-hidden="true">
      {[
        { x: 12, y: 12, r: 6 },
        { x: 28, y: 16, r: 4 },
        { x: 18, y: 30, r: 5 },
      ].map(({ x, y, r }) => (
        <path
          key={`${x}-${y}`}
          d={`M${x} ${y - r} L${x + r / 3} ${y - r / 3} L${x + r} ${y} L${x + r / 3} ${y + r / 3} L${x} ${y + r} L${x - r / 3} ${y + r / 3} L${x - r} ${y} L${x - r / 3} ${y - r / 3} Z`}
          fill="#f2a93b"
        />
      ))}
    </svg>
  );
}

export function StepScores({ run }: { readonly run: DishRun }) {
  const dish = dishById(run.dishId);
  const accuracies = runAccuracies(run, dish);
  const current = currentCookStep(run, dish);
  const steps = cookSteps(dish);
  const done = steps.slice(0, current === null ? steps.length : steps.indexOf(current));
  if (done.length === 0) return null;
  return (
    <div className="ck-step-board">
      <span className="ck-step-board__title">Nice work so far</span>
      <ul className="ck-step-scores" aria-label="Steps cooked">
        {done.map((kind) => (
          <li key={kind}>
            <Icon name="check" size={16} /> {COOK_STEP_NAMES[kind]} {Math.round(accuracies[kind] * 100)}%
          </li>
        ))}
        <Sparkle key={done.length} />
      </ul>
    </div>
  );
}
