import { Icon } from "../kit/IconSet";

export interface StepperStep {
  readonly id: string;
  readonly label: string;
}

export interface NewGameStepperProps {
  readonly steps: readonly StepperStep[];
  readonly index: number;
}

export function NewGameStepper({ steps, index }: NewGameStepperProps) {
  return (
    <ol className="ad-stepper" aria-label="New game steps">
      {steps.map((step, position) => {
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
