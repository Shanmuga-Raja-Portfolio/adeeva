import { useState } from "react";
import { Icon } from "../../../../../ui/kit/IconSet";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { batchMix, batchName, productById } from "../../../core";
import { useAssist } from "../../useAssist";
import { OvenBench } from "./OvenBench";
import { StageFooter } from "./StageFooter";
import { assistHint, SAFETY_LINE } from "./stageNames";
import type { StageProps } from "./stageProps";
import "./oven.css";

export function BakeStage(props: StageProps) {
  const { run, dispatch } = props;
  const [assist, setAssist] = useAssist("oven");
  const [baking, setBaking] = useState(false);
  const firstOpen = run.batches.findIndex((entry) => entry.bake === null);
  const [batch, setBatch] = useState(Math.max(0, firstOpen));
  const mix = batchMix(run, batch);
  const entry = run.batches[batch];
  if (mix === null || entry === undefined || run.design.productId === null) return null;
  const product = productById(run.design.productId);
  const locked = batch > 0 && run.batches[batch - 1]?.bake === null;
  return (
    <div className="pa-bake-stage">
      {run.batches.length > 1 ? (
        <div className="pa-weigh__tabs" role="tablist" aria-label="Bakes">
          {run.batches.map((item, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === batch}
              className="pa-weigh__tab"
              onClick={() => setBatch(index)}
            >
              {batchName(product, index)} {item.bake !== null ? <Icon name="check" size={14} /> : null}
            </button>
          ))}
        </div>
      ) : null}
      <OvenBench
        key={`${batch}-${assist ? "a" : "m"}`}
        batch={batch}
        mix={mix}
        assisted={assist}
        stored={entry.bake}
        locked={locked}
        dispatch={dispatch}
        onBakingChange={setBaking}
      />
      {locked ? <p className="pa-hint">Bake the big tier first, then this one.</p> : null}
      <div className="pa-bake-stage__help">
        <ToggleSwitch
          label="Oven helper"
          description="Sets the heat, turns the tray and rings at golden. Counts up to 80%."
          checked={assist}
          onChange={setAssist}
          disabled={baking}
        />
        <p className="pa-hint">{assistHint("Oven helper")}</p>
        <p className="pa-safety">{SAFETY_LINE}</p>
      </div>
      <StageFooter {...props} ready="Out of the oven and cooling. Lovely!" />
    </div>
  );
}
