import { useSettings } from "../../../../../studio/SettingsContext";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { SEAM_PROFILES } from "../../../../adeeva/content/garmentPart";
import { AssistSwitch } from "../../../../adeeva/ui/screens/craft/AssistSwitch";
import { SewingMachine } from "../../../../adeeva/ui/screens/craft/SewingMachine";
import "../../../../adeeva/ui/screens/craft/sew.css";
import { HINTS } from "../../../content/hint";
import {
  cellThreshold,
  findById,
  gentleLimit,
  isWellMended,
  maxPull,
  sewBand,
  tableDone,
  tableOwned,
  type Action,
  type GameState,
  type SwapTable,
} from "../../../core";
import { findCloth } from "../../art/findCloth";
import { StainScrubber } from "../flip/clean/StainScrubber";
import { StitchBench } from "../flip/unpick/StitchBench";
import "../flip/workbench.css";
import "../flip/cut/cut.css";

export interface TableWorkProps {
  readonly state: GameState;
  readonly table: SwapTable;
  readonly dispatch: (action: Action) => boolean;
  readonly onClose: () => void;
}

const KIND_HINT: Readonly<Record<SwapTable["kind"], string>> = {
  stitch: HINTS.unpick,
  stain: HINTS.clean,
  seam: HINTS.sew,
};

export function TableWork({ state, table, dispatch, onClose }: TableWorkProps) {
  const { settings, reducedMotion, updateSettings } = useSettings();
  const find = findById(table.findId);
  const done = tableDone(state, table);
  const line = find.lines[table.line];
  return (
    <section className="tf-table-work" aria-label={`Mending for ${table.neighbour}`} data-testid="table-work">
      <header className="tf-table-work__head">
        <div>
          <span className="ad-eyebrow">{table.neighbour}&apos;s table</span>
          <h2>{find.name}</h2>
        </div>
        <Button variant="ghost" onClick={onClose} data-testid="table-close">
          Back to the tables
        </Button>
      </header>
      <p className="tf-hint">
        <Icon name="sparkle" size={18} />
        {KIND_HINT[table.kind]}
      </p>
      {done ? (
        <div className="tf-table-work__done" role="status">
          <Icon name="heart" size={32} />
          <strong>{isWellMended(state, table) ? "Well mended!" : "Mended with love"}</strong>
          <span className="ad-muted">{table.neighbour} says thank you, and it&apos;s back in use.</span>
        </div>
      ) : null}
      {!done && table.kind === "stitch" && line !== undefined ? (
        <>
          <StitchBench
            find={find}
            line={line}
            record={table.unpick}
            maxPullCm={maxPull(state, find.material)}
            assist={settings.assistUnpick}
            sharpRipper={state.upgrades.includes("sharp-ripper")}
            reducedMotion={reducedMotion}
            onPull={(request) => dispatch({ type: "tablePull", tableId: table.id, ...request })}
          />
          <AssistSwitch
            label="Assist snip"
            detail="Tap to pop stitches."
            checked={settings.assistUnpick}
            onChange={(assistUnpick) => updateSettings({ assistUnpick })}
          />
        </>
      ) : null}
      {!done && table.kind === "stain" ? (
        <>
          <StainScrubber
            find={find}
            stain={table.stain}
            stored={table.scrub}
            threshold={cellThreshold(state, tableOwned(table), table.stain)}
            gentle={gentleLimit(state, find.material)}
            reducedMotion={reducedMotion}
            onRecord={(work) => dispatch({ type: "tableScrub", tableId: table.id, ...work })}
          />
          <AssistSwitch
            label="Assist soak"
            detail="One tap soaks the stain."
            checked={settings.assistClean}
            onChange={(assistClean) => updateSettings({ assistClean })}
          />
          {settings.assistClean ? (
            <Button icon="sparkle" onClick={() => dispatch({ type: "tableSoak", tableId: table.id })}>
              Soak it
            </Button>
          ) : null}
        </>
      ) : null}
      {!done && table.kind === "seam" ? (
        <>
          <SewingMachine
            seamName="Short seam"
            profile={SEAM_PROFILES.gentle}
            fabric={findCloth(find)}
            band={sewBand(state, find.material, settings.assistSew)}
            stored={table.seam ?? undefined}
            assisted={settings.assistSew}
            onRecord={(sample) => dispatch({ type: "tableSew", tableId: table.id, ...sample })}
            onReset={() => dispatch({ type: "resetTableSeam", tableId: table.id })}
            onNext={null}
          />
          <AssistSwitch
            label="Assist sew"
            detail="A wider guide line."
            checked={settings.assistSew}
            onChange={(assistSew) => updateSettings({ assistSew })}
          />
        </>
      ) : null}
      <p className="tf-safety">{HINTS.safety}</p>
    </section>
  );
}
