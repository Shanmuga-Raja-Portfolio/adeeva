import { useState } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { canRingBell, dishById } from "../../../core";
import { PassBell } from "../../art/PassBell";
import { PassScene } from "../../art/PassScene";
import { PlateArt } from "../../art/PlateArt";
import { PlateSparkles } from "../../art/PlateSparkles";
import { STAGE_LINES } from "../../instructions/stageInstruction";
import { useKitchenSound } from "../../sound/SoundContext";
import type { StageProps } from "./stageProps";
import "./pass.css";

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
      <header className="ck-pass__head">
        <h2 className="ck-stage-title">The pass</h2>
        <p className="ck-chop__hint ck-pass__hint" data-testid="station-instruction">
          {STAGE_LINES.pass}
        </p>
      </header>
      <div className="ck-pass__scene">
        <PassScene dishName={dishById(run.dishId).name} className="ck-pass__backdrop" />
        <div className={ringing ? "ck-pass__shelf ck-pass__shelf--away" : "ck-pass__shelf"}>
          <div className="ck-burst ck-pass__burst" aria-hidden="true" />
          {plated !== null ? (
            <PlateArt
              colour={plated.plateColour}
              components={plated.components}
              title="Your plate, under the warm lamp"
              className="ck-pass__plate"
            />
          ) : null}
          <PlateSparkles className="ck-pass__sparkles" />
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
    </div>
  );
}
