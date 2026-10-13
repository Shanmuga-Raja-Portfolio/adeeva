import { Icon } from "../../../../../ui/kit/IconSet";
import { NEW_GAME_STEPS } from "./newGameDraft";

export interface NewGameStepperProps {
  index: number;
}

export function NewGameStepper({ index }: NewGameStepperProps) {
  return (
    <ol className="ad-stepper" aria-label="New game steps">
      {NEW_GAME_STEPS.map((step, position) => {
        const state = position < index ? "done" : position === index ? "current" : "todo";
        return (
          <li
            key={step.id}
            className={`ad-stepper__step ad-stepper__step--${state}`}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span className="ad-stepper__dot">
              {state === "done" ? <Icon name="check" size={14} /> : position + 1}
            </span>
            <span className="ad-stepper__label">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
