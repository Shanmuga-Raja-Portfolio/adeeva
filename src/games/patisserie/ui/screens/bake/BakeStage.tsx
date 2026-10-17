import { useState } from "react";
import { Icon } from "../../../../../ui/kit/IconSet";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import {
  bakesTogether,
  bakeTimeScale,
  batchMix,
  batchName,
  productById,
  TOGETHER_BATCHES,
} from "../../../core";
import { useAssist } from "../../useAssist";
import { OvenBench } from "./OvenBench";
import { OvenPair, type OvenPairTier } from "./OvenPair";
import { StageFooter } from "./StageFooter";
import { assistHint, HELPER_NOTE } from "./stageNames";
import type { StageProps } from "./stageProps";
import "./oven.css";

const PAIR_TAB = -1;

export function BakeStage(props: StageProps) {
  const { run, dispatch } = props;
  const [assist, setAssist] = useAssist("oven");
  const [baking, setBaking] = useState(false);
  const together = bakesTogether(run);
  const firstOpen = run.batches.findIndex((entry) => entry.bake === null);
  const pairOpen = together && TOGETHER_BATCHES.some((batch) => run.batches[batch]?.bake === null);
  const [picked, setPicked] = useState(pairOpen ? PAIR_TAB : Math.max(0, firstOpen));
  const batch = together && picked !== PAIR_TAB && picked < TOGETHER_BATCHES.length ? PAIR_TAB : picked;
  if (run.design.productId === null) return null;
  const product = productById(run.design.productId);
  const pairTiers = TOGETHER_BATCHES.flatMap((index): OvenPairTier[] => {
    const mix = batchMix(run, index);
    const entry = run.batches[index];
    return mix === null || entry === undefined
      ? []
      : [{ name: batchName(product, index), mix, scale: bakeTimeScale(run, index), stored: entry.bake }];
  });
  const [pairA, pairB] = pairTiers;
  const tabs = together
    ? [
        { id: PAIR_TAB, label: "Big and middle together", done: !pairOpen },
        ...run.batches
          .map((entry, index) => ({ id: index, label: batchName(product, index), done: entry.bake !== null }))
          .slice(TOGETHER_BATCHES.length),
      ]
    : run.batches.map((entry, index) => ({
        id: index,
        label: batchName(product, index),
        done: entry.bake !== null,
      }));
  const mix = batch === PAIR_TAB ? null : batchMix(run, batch);
  const entry = batch === PAIR_TAB ? undefined : run.batches[batch];
  const locked = batch > 0 && run.batches[batch - 1]?.bake === null;
  return (
    <div className="pa-bake-stage">
      {tabs.length > 1 ? (
        <div className="pa-weigh__tabs" role="tablist" aria-label="Bakes">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tab.id === batch}
              className="pa-weigh__tab"
              onClick={() => setPicked(tab.id)}
            >
              {tab.label} {tab.done ? <Icon name="check" size={14} /> : null}
            </button>
          ))}
        </div>
      ) : null}
      {batch === PAIR_TAB && pairA !== undefined && pairB !== undefined ? (
        <OvenPair
          key={assist ? "a" : "m"}
          tiers={[pairA, pairB]}
          assisted={assist}
          dispatch={dispatch}
          onBakingChange={setBaking}
        />
      ) : null}
      {mix !== null && entry !== undefined ? (
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
      ) : null}
      {locked ? <p className="pa-hint">Bake the tier before this one first.</p> : null}
      <div className="pa-bake-stage__help">
        <ToggleSwitch
          label="Oven helper"
          description={`Sets the heat, turns the tray and rings at golden. ${HELPER_NOTE}`}
          checked={assist}
          onChange={setAssist}
          disabled={baking}
        />
        {assist ? null : <p className="pa-hint">{assistHint("Oven helper")}</p>}
      </div>
      <StageFooter {...props} ready="Out of the oven and cooling. Lovely!" safety />
    </div>
  );
}
