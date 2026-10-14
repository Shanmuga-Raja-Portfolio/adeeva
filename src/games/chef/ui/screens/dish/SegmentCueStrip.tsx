import type { CueKind } from "../../../content/cueCard";
import { cueCardById, currentCookStep, dishById, type DishRun } from "../../../core";
import "./segmentCueStrip.css";

function cueNow(run: DishRun): CueKind | null {
  if (run.stage === "mise" || run.stage === "ticket") return "ready";
  if (run.stage === "cook") return currentCookStep(run, dishById(run.dishId));
  return run.stage === "plate" || run.stage === "pass" ? "plate" : null;
}

export function SegmentCueStrip({ run }: { readonly run: DishRun }) {
  if (run.purpose.kind !== "segment") return null;
  const now = cueNow(run);
  return (
    <aside className="ck-cue-strip" aria-label="Your cue cards" data-testid="cue-strip">
      <span className="ck-cue__badge">Cook with an adult</span>
      <ol className="ck-cue-strip__cards">
        {run.purpose.cards.map((card, index) => {
          const def = cueCardById(card.cue);
          return (
            <li
              key={card.cue}
              className={
                card.cue === now ? "ck-cue-strip__card ck-cue-strip__card--now" : "ck-cue-strip__card"
              }
            >
              <span className="ck-cue-strip__step">{index + 1}</span>
              <strong>{def.label}</strong>
              <span>{def.tips[card.tip]?.text}</span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
