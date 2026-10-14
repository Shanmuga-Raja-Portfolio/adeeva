import { useState, type PointerEvent } from "react";
import { colourById, type ColourId } from "../../../../../../engine/palette";
import { FabricSwatch } from "../../../../../adeeva/ui/art/FabricSwatch";
import { TrimBadge } from "../../../../../adeeva/ui/art/TrimArt";
import { TRIM_IDS } from "../../../../../adeeva/content/trim";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { MARKS, PAINT_COLOURS, PATCHES } from "../../../../content/finish";
import {
  availableSavedTrims,
  scrapInUse,
  trimById,
  type FinishRequest,
  type GameState,
} from "../../../../core";
import { MarkArt } from "../../../art/MarkArt";
import { PatchArt } from "../../../art/PatchArt";

export type DrawerTab = "patches" | "saved" | "tin" | "marks";

export interface FinishDrawerProps {
  readonly state: GameState;
  readonly onPick: (request: FinishRequest) => void;
  readonly onDragStart: (event: PointerEvent<HTMLButtonElement>, request: FinishRequest) => void;
  readonly onDragMove: (event: PointerEvent<HTMLButtonElement>) => void;
  readonly onDragEnd: (event: PointerEvent<HTMLButtonElement>) => void;
  readonly onDragCancel: () => void;
}

const TABS: readonly { readonly id: DrawerTab; readonly label: string }[] = [
  { id: "patches", label: "Scrap patches" },
  { id: "saved", label: "Saved buttons & bows" },
  { id: "tin", label: "Trim tin" },
  { id: "marks", label: "Mend & paint" },
];

export function FinishDrawer({
  state,
  onPick,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
}: FinishDrawerProps) {
  const [tab, setTab] = useState<DrawerTab>("patches");
  const free = state.stock.scraps.filter((scrap) => !scrapInUse(state.activeRun, scrap.id));
  const [scrapId, setScrapId] = useState<string | null>(null);
  const scrap = free.find((entry) => entry.id === scrapId) ?? free[0];
  const [paint, setPaint] = useState<ColourId>(PAINT_COLOURS[0] ?? "coral");
  const chipProps = (request: FinishRequest) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => onDragStart(event, request),
    onPointerMove: onDragMove,
    onPointerUp: onDragEnd,
    onPointerCancel: onDragCancel,
    onLostPointerCapture: onDragCancel,
    onClick: (event: { detail: number }) => {
      if (event.detail === 0) onPick(request);
    },
  });
  const saved = TRIM_IDS.filter((id) => availableSavedTrims(state, id) > 0);
  return (
    <div className="tf-drawer">
      <div className="tf-tabs" role="tablist" aria-label="Finishing drawer">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={tab === entry.id}
            className="tf-tab"
            onClick={() => setTab(entry.id)}
            data-drawer={entry.id}
          >
            {entry.label}
          </button>
        ))}
      </div>
      {tab === "patches" ? (
        <div className="tf-drawer__panel">
          {scrap === undefined ? (
            <p className="ad-muted">No scraps left. Leftover fabric from your finds becomes scraps.</p>
          ) : (
            <>
              <span className="ad-eyebrow">Pick a scrap</span>
              <div className="tf-drawer__scraps" role="radiogroup" aria-label="Scraps">
                {free.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    role="radio"
                    aria-checked={entry.id === scrap.id}
                    className="tf-scrap"
                    onClick={() => setScrapId(entry.id)}
                    title={entry.name}
                    aria-label={entry.name}
                  >
                    <FabricSwatch fabric={entry} size={40} decorative />
                  </button>
                ))}
              </div>
              <span className="ad-eyebrow">Drag a patch onto your piece</span>
              <div className="tf-drawer__items">
                {PATCHES.map((patch) => (
                  <button
                    key={patch.id}
                    type="button"
                    className="tf-chip"
                    data-finish={patch.id}
                    aria-label={`${patch.name} from ${scrap.name}`}
                    {...chipProps({ kind: "patch", patchId: patch.id, scrapId: scrap.id })}
                  >
                    <svg viewBox="-24 -24 48 48" width={48} height={48} aria-hidden="true">
                      <PatchArt patchId={patch.id} cloth={scrap} />
                    </svg>
                    <span>{patch.name}</span>
                    <small>1 scrap</small>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ) : null}
      {tab === "saved" ? (
        <div className="tf-drawer__panel">
          {saved.length === 0 ? (
            <p className="ad-muted">Nothing saved yet. Gentle snips save buttons and bows.</p>
          ) : (
            <div className="tf-drawer__items">
              {saved.map((trimId) => (
                <button
                  key={trimId}
                  type="button"
                  className="tf-chip tf-chip--saved"
                  data-finish={`saved-${trimId}`}
                  aria-label={`Saved ${trimById(trimId).name}`}
                  {...chipProps({ kind: "trim", trimId, source: "saved" })}
                >
                  <TrimBadge trimId={trimId} size={44} />
                  <span>{trimById(trimId).name}</span>
                  <small>
                    <Icon name="heart" size={12} /> {availableSavedTrims(state, trimId)} saved · free
                  </small>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
      {tab === "tin" ? (
        <div className="tf-drawer__panel">
          <div className="tf-drawer__items">
            {TRIM_IDS.map((trimId) => (
              <button
                key={trimId}
                type="button"
                className="tf-chip"
                data-finish={`new-${trimId}`}
                aria-label={`New ${trimById(trimId).name}, ${trimById(trimId).price} coins`}
                disabled={trimById(trimId).price > state.coins}
                {...chipProps({ kind: "trim", trimId, source: "new" })}
              >
                <TrimBadge trimId={trimId} size={44} />
                <span>{trimById(trimId).name}</span>
                <small>
                  <Icon name="coin" size={12} /> {trimById(trimId).price}
                </small>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {tab === "marks" ? (
        <div className="tf-drawer__panel">
          <span className="ad-eyebrow">Paint colour</span>
          <div className="tf-drawer__paints" role="radiogroup" aria-label="Paint colour">
            {PAINT_COLOURS.map((colour) => (
              <button
                key={colour}
                type="button"
                role="radio"
                aria-checked={paint === colour}
                aria-label={colourById(colour).name}
                className="tf-paint"
                style={{ background: colourById(colour).hex }}
                onClick={() => setPaint(colour)}
              />
            ))}
          </div>
          <div className="tf-drawer__items">
            {MARKS.map((mark) => {
              const request: FinishRequest =
                mark.id === "paint-dots"
                  ? { kind: "mark", markId: mark.id, colour: paint }
                  : { kind: "mark", markId: mark.id, colour: null };
              return (
                <button
                  key={mark.id}
                  type="button"
                  className="tf-chip"
                  data-finish={mark.id}
                  aria-label={`${mark.name}, ${mark.price} ${mark.price === 1 ? "coin" : "coins"}`}
                  disabled={mark.price > state.coins}
                  {...chipProps(request)}
                >
                  <svg viewBox="-24 -24 48 48" width={48} height={48} aria-hidden="true">
                    <MarkArt markId={mark.id} colour={request.kind === "mark" ? request.colour : null} />
                  </svg>
                  <span>{mark.name}</span>
                  <small>
                    <Icon name="coin" size={12} /> {mark.price}
                  </small>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
