import { useState } from "react";
import { Icon } from "../../../../../ui/kit/IconSet";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { batchMix, batchName, productById, stirDone, stirHalfWidth } from "../../../core";
import { useAssist } from "../../useAssist";
import { StageFooter } from "./StageFooter";
import { assistHint, HELPER_NOTE } from "./stageNames";
import type { StageProps } from "./stageProps";
import { StirBowl } from "./StirBowl";
import "./mix.css";

export function MixStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const [assist, setAssist] = useAssist("stir");
  const firstOpen = run.batches.findIndex((entry, index) => {
    const mix = batchMix(run, index);
    return mix !== null && !stirDone(entry.stir, mix);
  });
  const [batch, setBatch] = useState(Math.max(0, firstOpen));
  const mix = batchMix(run, batch);
  const entry = run.batches[batch];
  if (mix === null || entry === undefined || run.design.productId === null) return null;
  const product = productById(run.design.productId);
  return (
    <div className="pa-mix">
      {run.batches.length > 1 ? (
        <div className="pa-weigh__tabs" role="tablist" aria-label="Bowls">
          {run.batches.map((item, index) => {
            const itemMix = batchMix(run, index);
            return (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === batch}
                className="pa-weigh__tab"
                onClick={() => setBatch(index)}
              >
                {batchName(product, index)}{" "}
                {itemMix !== null && stirDone(item.stir, itemMix) ? <Icon name="check" size={14} /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
      <div className="pa-mix__layout">
        <StirBowl
          key={batch}
          batch={batch}
          mix={mix}
          halfWidth={stirHalfWidth(state, mix, assist)}
          assisted={assist}
          stored={entry.stir}
          dispatch={dispatch}
        />
        <aside className="pa-mix__side pa-doily">
          <h2>{mix.name}</h2>
          <p>
            Stir {mix.laps} laps. Keep the dot on the speed gauge in the <b>green</b>.{" "}
            {mix.stiffness >= 0.6
              ? "This dough is stiff, so the green is narrow."
              : "This mix is soft and easy going."}
          </p>
          <ToggleSwitch
            label="Steady spoon"
            description={`A wider green zone. ${HELPER_NOTE}`}
            checked={assist}
            onChange={setAssist}
          />
          {assist ? null : <p className="pa-hint">{assistHint("Steady spoon")}</p>}
        </aside>
      </div>
      <StageFooter {...props} ready="Silky smooth. Into the oven!" />
    </div>
  );
}
