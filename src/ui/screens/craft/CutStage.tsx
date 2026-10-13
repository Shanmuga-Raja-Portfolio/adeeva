import { useState } from "react";
import { fabricById, fabricsNeedingCut, fabricPlacementIssues, requiredPieces } from "../../../core";
import { useSettings } from "../../../app/SettingsContext";
import { FabricSwatch } from "../../art/FabricSwatch";
import { Button } from "../../kit/Button";
import { Dialog } from "../../kit/Dialog";
import { Icon } from "../../kit/IconSet";
import { AssistSwitch } from "./AssistSwitch";
import { CutSession } from "./CutSession";
import { FabricShop } from "./FabricShop";
import { GrainBadge } from "./GrainBadge";
import { LayoutWorkspace } from "./LayoutWorkspace";
import { PieceThumb } from "./PieceThumb";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import "./cut.css";

export function CutStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const { settings, reducedMotion, updateSettings } = useSettings();
  const fabricIds = fabricsNeedingCut(run.design);
  const firstOpen = fabricIds.find((fabricId) => !run.cutFabrics.includes(fabricId)) ?? fabricIds[0] ?? "";
  const [picked, setPicked] = useState<string | null>(null);
  const [cutting, setCutting] = useState<string | null>(null);
  const [shopping, setShopping] = useState(false);
  const uncut = fabricIds.some((fabricId) => !run.cutFabrics.includes(fabricId));
  const activeId = picked !== null && fabricIds.includes(picked) ? picked : firstOpen;
  const fabric = fabricById(activeId);
  const isCut = run.cutFabrics.includes(activeId);
  const owned = state.inventory.fabricMetres[activeId] ?? 0;
  const entries = requiredPieces(run.design).filter((entry) => entry.fabricId === activeId);

  const closeShopping = () => {
    setShopping(false);
    if (state.calendar.shopOpen) dispatch({ type: "closeShop" });
  };

  return (
    <div className="ad-cut-stage">
      <div className="ad-cut-stage__top">
        <div className="ad-fabric-tabs" role="tablist" aria-label="Fabrics to cut">
          {fabricIds.map((fabricId) => {
            const tabFabric = fabricById(fabricId);
            const done = run.cutFabrics.includes(fabricId);
            const open = done
              ? 0
              : fabricPlacementIssues(run, fabricId, state.inventory.fabricMetres[fabricId] ?? 0).length;
            return (
              <button
                key={fabricId}
                type="button"
                role="tab"
                aria-selected={fabricId === activeId}
                className="ad-fabric-tab"
                onClick={() => {
                  setPicked(fabricId);
                  setCutting(null);
                }}
              >
                {tabFabric !== undefined ? <FabricSwatch fabric={tabFabric} size={32} decorative /> : null}
                <span className="ad-fabric-tab__name">{tabFabric?.name ?? fabricId}</span>
                <span
                  className={
                    done ? "ad-fabric-tab__state ad-fabric-tab__state--done" : "ad-fabric-tab__state"
                  }
                >
                  {done ? <Icon name="check" size={14} /> : open > 0 ? `${open} to fix` : "Ready"}
                </span>
              </button>
            );
          })}
        </div>
        {uncut ? (
          <Button
            variant="secondary"
            size="sm"
            icon="bag"
            onClick={() => setShopping(true)}
            data-testid="top-up"
          >
            Top up fabric
          </Button>
        ) : null}
        <AssistSwitch
          label="Assist cut"
          detail="Skip the tracing: every piece is cut at a steady 80%."
          checked={settings.assistCut}
          onChange={(assistCut) => updateSettings({ assistCut })}
        />
      </div>

      {isCut ? (
        <div className="ad-cut-done">
          <header>
            <Icon name="check" size={20} />
            <strong>{fabric?.name ?? "This fabric"} is cut and folded.</strong>
          </header>
          <ul className="ad-cut-done__list">
            {entries.map((entry) => {
              const placement = run.placements[entry.piece.id];
              return (
                <li key={entry.piece.id} className="ad-cut-done__piece">
                  <PieceThumb
                    piece={entry.piece}
                    fabric={fabric}
                    rotation={placement?.rotation ?? 0}
                    size={72}
                    cut
                  />
                  <span className="ad-cut-done__name">{entry.piece.name}</span>
                  <span className="ad-cut-done__score">
                    {Math.round((run.cutAccuracy[entry.piece.id] ?? 0) * 100)}% clean
                  </span>
                  {placement !== undefined ? (
                    <GrainBadge piece={entry.piece} rotation={placement.rotation} compact />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : cutting === activeId ? (
        <CutSession
          key={activeId}
          state={state}
          run={run}
          fabricId={activeId}
          fabric={fabric}
          dispatch={dispatch}
          assistCut={settings.assistCut}
          reducedMotion={reducedMotion}
          onBackToLayout={() => setCutting(null)}
        />
      ) : (
        <LayoutWorkspace
          key={activeId}
          state={state}
          run={run}
          fabricId={activeId}
          fabric={fabric}
          dispatch={dispatch}
          onStartCutting={() => setCutting(activeId)}
        />
      )}
      {owned <= 0 && !isCut ? (
        <p className="ad-layout-issues">You have no {fabric?.name ?? "fabric"} left.</p>
      ) : null}
      <Dialog
        open={shopping}
        title="Top up fabric"
        onClose={closeShopping}
        className="ad-dialog--wide"
        footer={<Button onClick={closeShopping}>Back to the cutting table</Button>}
      >
        <FabricShop {...props} />
      </Dialog>
      <StageFooter {...props} hint="Every panel is cut. Off to the dress form!" />
    </div>
  );
}
