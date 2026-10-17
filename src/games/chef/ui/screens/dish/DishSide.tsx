import { Icon } from "../../../../../ui/kit/IconSet";
import type { CookStepKind } from "../../../content/dish";
import { HINTS } from "../../../content/hints";
import { currentCookStep, dishById, type DishRun } from "../../../core";
import type { AssistStep } from "../../useAssist";
import { HelperCard } from "./HelperCard";
import { StepScores } from "./StepScores";
import { TicketChecklist } from "./TicketChecklist";

const SAFETY_STEPS: readonly CookStepKind[] = ["chop", "sizzle", "simmer"];

function helperStep(run: DishRun): AssistStep | null {
  if (run.stage === "plate") return "plate";
  if (run.stage !== "cook") return null;
  return currentCookStep(run, dishById(run.dishId));
}

export function DishSide({ run }: { readonly run: DishRun }) {
  const step = helperStep(run);
  return (
    <div className="ck-dish__side">
      <TicketChecklist run={run} />
      {run.stage === "cook" ? <StepScores run={run} /> : null}
      {step === null ? null : (
        <HelperCard
          key={step}
          step={step}
          note={
            step !== "plate" && SAFETY_STEPS.includes(step) ? (
              <p className="ck-safety ck-dish__safety">
                <Icon name="shield" size={16} /> {HINTS.safety}
              </p>
            ) : null
          }
        />
      )}
    </div>
  );
}
