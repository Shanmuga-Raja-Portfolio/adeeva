import { useState } from "react";
import { useSettings } from "../../../../../../studio/SettingsContext";
import { Button } from "../../../../../../ui/kit/Button";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { AssistSwitch } from "../../../../../adeeva/ui/screens/craft/AssistSwitch";
import { HINTS } from "../../../../content/hint";
import {
  cellThreshold,
  clearedCells,
  findById,
  gentleLimit,
  isStainDone,
  stainWork,
  type OwnedFind,
  type Stain,
} from "../../../../core";
import { StageFooter } from "../StageFooter";
import type { StageProps } from "../stageProps";
import { StainScrubber } from "./StainScrubber";
import { SoapDish, WashTub } from "../../../art/WashKit";
import "../workbench.css";

interface StainEntry {
  readonly owned: OwnedFind;
  readonly stain: Stain;
  readonly key: string;
}

export function CleanStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const { settings, reducedMotion, updateSettings } = useSettings();
  const [chosen, setChosen] = useState<string | null>(null);
  const stains: StainEntry[] = run.finds.flatMap((owned) =>
    owned.stains.map((stain) => ({ owned, stain, key: `${owned.id}#${stain.id}` })),
  );
  const firstOpen = stains.find((entry) => !isStainDone(state, run, entry.owned, entry.stain));
  const picked = stains.find((entry) => entry.key === chosen);
  const pickedOpen =
    picked !== undefined && !isStainDone(state, run, picked.owned, picked.stain) ? picked : undefined;
  const current = pickedOpen ?? firstOpen ?? picked ?? stains[0];
  const done = stains.filter((entry) => isStainDone(state, run, entry.owned, entry.stain)).length;

  return (
    <div className="tf-workbench tf-workbench--clean">
      <div className="tf-workbench__top">
        <p className="tf-hint">
          <Icon name="sparkle" size={18} />
          {HINTS.clean}
        </p>
        <AssistSwitch
          label="Assist soak"
          detail="Soaks all stains. Scores a bit less."
          checked={settings.assistClean}
          onChange={(assistClean) => updateSettings({ assistClean })}
        />
      </div>
      <div className="tf-workbench__row">
        <div className="tf-workbench__lines" role="tablist" aria-label="Stains">
          {stains.map((entry, index) => {
            const finished = isStainDone(state, run, entry.owned, entry.stain);
            const cleared = clearedCells(
              state,
              entry.owned,
              entry.stain,
              stainWork(run, entry.owned.id, entry.stain),
            );
            return (
              <button
                key={entry.key}
                type="button"
                role="tab"
                aria-selected={entry.key === current?.key}
                className={finished ? "tf-line-chip tf-line-chip--done" : "tf-line-chip"}
                onClick={() => setChosen(entry.key)}
                data-stain-chip={index}
              >
                {finished ? <Icon name="check" size={14} /> : null}
                {run.finds.length > 1 ? `${findById(entry.owned.findId).name} · ` : ""}Stain {index + 1} ·{" "}
                {run.soaked ? "soaked" : `${cleared}/${entry.stain.cells}`}
              </button>
            );
          })}
        </div>
        <div className="tf-workbench__tally">
          <div
            className="tf-progress tf-progress--mint"
            aria-label={`${done} of ${stains.length} stains done`}
          >
            <span style={{ width: `${(100 * done) / Math.max(1, stains.length)}%` }} />
          </div>
          <span>
            {done}/{stains.length} stains done
          </span>
          {settings.assistClean && !run.soaked ? (
            <Button icon="sparkle" onClick={() => dispatch({ type: "soakStains" })} data-testid="soak">
              Soak it
            </Button>
          ) : null}
        </div>
      </div>
      <div className="tf-workbench__table tf-workbench__table--wash">
        <WashTub className="tf-wash tf-wash--tub" />
        <SoapDish className="tf-wash tf-wash--soap" />
        {run.soaked ? (
          <div className="tf-soaked" role="status">
            <span className="tf-soaked__tub" aria-hidden="true">
              <Icon name="sparkle" size={42} />
            </span>
            <strong>Soaked clean!</strong>
            <span className="ad-muted">Soap, water and patience did the work.</span>
          </div>
        ) : current !== undefined ? (
          <StainScrubber
            key={current.key}
            find={findById(current.owned.findId)}
            stain={current.stain}
            stored={stainWork(run, current.owned.id, current.stain)}
            threshold={cellThreshold(state, current.owned, current.stain)}
            gentle={gentleLimit(state, findById(current.owned.findId).material)}
            reducedMotion={reducedMotion}
            onRecord={(work) =>
              dispatch({
                type: "scrubStain",
                findKey: current.owned.id,
                stainId: current.stain.id,
                cellTicks: work.cellTicks,
                harshTicks: work.harshTicks,
                scrubTicks: work.scrubTicks,
              })
            }
          />
        ) : null}
      </div>
      <p className="tf-safety">
        <Icon name="shield" size={18} />
        {HINTS.safety}
      </p>
      <StageFooter {...props} hint="Fresh and clean! Time to lay out the pieces." />
    </div>
  );
}
