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
import "./clean.css";

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

  const shares = stains.map((entry) =>
    run.soaked
      ? 1
      : clearedCells(state, entry.owned, entry.stain, stainWork(run, entry.owned.id, entry.stain)) /
        Math.max(1, entry.stain.cells),
  );

  return (
    <div className="tf-workbench tf-workbench--clean">
      <div className="tf-workbench__top">
        <div className="tf-workbench__lines" role="tablist" aria-label="Stains">
          {stains.map((entry, index) => {
            const finished = isStainDone(state, run, entry.owned, entry.stain);
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
                {finished ? <Icon name="check" size={16} /> : null}
                {run.finds.length > 1 ? `${findById(entry.owned.findId).name} · ` : ""}Stain {index + 1}
              </button>
            );
          })}
        </div>
        <div className="tf-workbench__assist">
          <AssistSwitch
            label="Assist soak"
            detail="Soaks all stains. Scores a bit less."
            checked={settings.assistClean}
            onChange={(assistClean) => updateSettings({ assistClean })}
          />
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
        <p className="tf-bench-caption">
          <Icon name="sparkle" size={20} />
          <span>{HINTS.clean}</span>
        </p>
        <div className="tf-wash-progress">
          <span>
            <strong>
              {done} of {stains.length}
            </strong>{" "}
            stains clean
          </span>
          <div className="tf-wash-segments" aria-label={`${done} of ${stains.length} stains done`}>
            {shares.map((share, index) => (
              <span key={stains[index]?.key ?? index} className="tf-progress tf-progress--mint">
                <span style={{ width: `${Math.round(100 * share)}%` }} />
              </span>
            ))}
          </div>
        </div>
        <p className="tf-safety tf-wash-safety">
          <Icon name="shield" size={16} />
          {HINTS.safety}
        </p>
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
      <StageFooter {...props} hint="Fresh and clean! Time to lay out the pieces." />
    </div>
  );
}
