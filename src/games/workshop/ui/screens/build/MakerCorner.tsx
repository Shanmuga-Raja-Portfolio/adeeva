import { Icon } from "../../../../../ui/kit/IconSet";
import { RUN_STAGES, type RunStage } from "../../../content/runStage";
import { COACH_HINTS } from "../../../content/hint";
import type { CommissionRun } from "../../../core";
import { pieceLook } from "../../art/pieceLook";
import { PiecePreview } from "../../art/PiecePreview";
import { STAGE_LABELS } from "./stageNames";

export interface MakerCornerProps {
  readonly run: CommissionRun;
}

const STEPS: readonly RunStage[] = RUN_STAGES.filter((stage) => stage !== "done");

export function MakerCorner({ run }: MakerCornerProps) {
  const look = pieceLook(run);
  const step = STEPS.indexOf(run.stage) + 1;
  const tip = COACH_HINTS[run.stage];
  return (
    <aside className="ww-corner ww-paper" aria-label="Your piece so far">
      <header className="ww-corner__head">
        <span className="ad-eyebrow">
          Step {step} of {STEPS.length}
        </span>
        <strong>{STAGE_LABELS[run.stage]}</strong>
      </header>
      {look !== null && run.stage !== "finish" ? (
        <div className="ww-corner__sketch">
          <PiecePreview look={look} title={null} className="ww-corner__piece" />
        </div>
      ) : null}
      <div className="ww-corner__progress" aria-hidden="true">
        {STEPS.map((stage, index) => (
          <span
            key={stage}
            className={
              index + 1 < step
                ? "ww-corner__dot ww-corner__dot--done"
                : index + 1 === step
                  ? "ww-corner__dot ww-corner__dot--now"
                  : "ww-corner__dot"
            }
          />
        ))}
      </div>
      {tip !== undefined ? (
        <p className="ww-corner__tip">
          <Icon name="sparkle" size={18} />
          <span>{tip}</span>
        </p>
      ) : null}
    </aside>
  );
}
