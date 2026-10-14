import { useState } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { canRingBell } from "../../../core";
import { PassBell } from "../../art/PassBell";
import { STAGE_LINES } from "../../instructions/stageInstruction";
import { PlateArt } from "../../art/PlateArt";
import { useKitchenSound } from "../../sound/SoundContext";
import type { StageProps } from "./stageProps";

export function PassStage({ state, run, dispatch }: StageProps) {
  const { reducedMotion } = useSettings();
  const { play } = useKitchenSound();
  const [ringing, setRinging] = useState(false);
  const plated = run.plated;
  const ring = () => {
    if (ringing || !canRingBell(state)) return;
    setRinging(true);
    play("bell");
    window.setTimeout(() => dispatch({ type: "ringBell" }), reducedMotion ? 0 : 650);
  };
  return (
    <div className="ck-pass">
      <h2 className="ck-stage-title">The pass</h2>
      <p className="ck-chop__hint" data-testid="station-instruction">
        {STAGE_LINES.pass}
      </p>
      <div className={ringing ? "ck-pass__shelf ck-pass__shelf--away" : "ck-pass__shelf"}>
        <div className="ck-pass__lamp" aria-hidden="true" />
        {plated !== null ? (
          <PlateArt
            colour={plated.plateColour}
            components={plated.components}
            title="Your plate, under the warm lamp"
            className="ck-pass__plate"
          />
        ) : null}
      </div>
      <button
        type="button"
        className="ck-bell-button"
        onClick={ring}
        disabled={ringing}
        data-testid="pass-bell"
        aria-label="Ring the pass bell: Service!"
      >
        <PassBell ringing={ringing && !reducedMotion} />
        <span>Service!</span>
      </button>
    </div>
  );
}
