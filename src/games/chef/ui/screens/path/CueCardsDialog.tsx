import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { useFocusAfterRender } from "../../../../../ui/kit/useFocusAfterRender";
import type { CueKind } from "../../../content/cueCard";
import type { StationId } from "../../../content/station";
import {
  cueCardById,
  dishById,
  startSegmentIssues,
  STEP_STATIONS,
  type Action,
  type GameState,
  type SegmentPrep,
} from "../../../core";
import { StationIcon } from "../../art/StationIcon";
import { HollisButton } from "./HollisButton";

export interface CueCardsDialogProps {
  readonly state: GameState;
  readonly prep: SegmentPrep | null;
  readonly open: boolean;
  readonly dispatch: (action: Action) => boolean;
  readonly onLive: () => void;
  readonly onClose: () => void;
}

function cueStation(cue: CueKind): StationId | null {
  return cue === "ready" ? null : STEP_STATIONS[cue];
}

function CueFace({ cue }: { readonly cue: CueKind }) {
  const station = cueStation(cue);
  return (
    <span className="ck-cue__face">
      {station === null ? (
        <span className="ck-cue__bowls" aria-hidden="true" />
      ) : (
        <StationIcon station={station} />
      )}
      <span>{cueCardById(cue).label}</span>
    </span>
  );
}

interface BodyProps {
  readonly state: GameState;
  readonly prep: SegmentPrep;
  readonly dispatch: (action: Action) => boolean;
  readonly onLive: () => void;
  readonly onClose: () => void;
  readonly focusAfter: (selectors: readonly string[]) => void;
}

function Body({ state, prep, dispatch, onLive, onClose, focusAfter }: BodyProps) {
  const place = (cue: CueKind) => {
    if (!dispatch({ type: "placeCue", cue })) return;
    const placed = [...prep.order, cue];
    const next = prep.deck.find((entry) => !placed.includes(entry));
    focusAfter([...(next === undefined ? [] : [`[data-testid="cue-${next}"]`]), ".ck-cue__tips input"]);
  };
  const shuffle = () => {
    if (dispatch({ type: "clearCues" })) focusAfter([".ck-cue__deck button"]);
  };
  const issue = startSegmentIssues(state)[0];
  const dish = dishById(prep.dishId);
  return (
    <Dialog
      open
      title={`Cue cards: ${dish.name}`}
      onClose={onClose}
      className="ad-dialog--wide ck-cue-dialog"
      footer={
        <>
          <HollisButton state={state} desk="cues" dispatch={dispatch} />
          <Button variant="ghost" onClick={shuffle} disabled={prep.order.length === 0}>
            Shuffle back
          </Button>
          <Button icon="sparkle" onClick={onLive} disabledReason={issue} showReason data-testid="go-live">
            Go live
          </Button>
        </>
      }
    >
      <p className="ck-dish-dialog__lead">Put the cards in cooking order, then pick kind tips.</p>
      <p className="ck-cue__badge">Cook with an adult</p>
      <div className="ck-cue__deck" role="group" aria-label="Cue cards to place">
        {prep.deck.map((cue) => {
          const placed = prep.order.includes(cue);
          return (
            <button
              key={cue}
              type="button"
              className={placed ? "ck-cue ck-cue--placed" : "ck-cue"}
              disabled={placed}
              onClick={() => place(cue)}
              data-testid={`cue-${cue}`}
            >
              <CueFace cue={cue} />
            </button>
          );
        })}
      </div>
      <ol className="ck-cue__slots">
        {prep.cues.map((_, index) => {
          const cue = prep.order[index];
          return (
            <li
              key={`slot-${index}`}
              className={cue === undefined ? "ck-cue__slot" : "ck-cue__slot ck-cue__slot--filled"}
            >
              <span className="ck-cue__number">{index + 1}</span>
              {cue === undefined ? <span className="ck-muted">Tap a card above</span> : <CueFace cue={cue} />}
            </li>
          );
        })}
      </ol>
      <div className="ck-cue__tips">
        {prep.deck.map((cue) => {
          const index = prep.cues.indexOf(cue);
          return (
            <fieldset key={cue} className="ck-cue__tip-set">
              <legend>Tip for “{cueCardById(cue).label}”</legend>
              {cueCardById(cue).tips.map((tip, tipIndex) => (
                <label
                  key={tip.text}
                  className={prep.tips[index] === tipIndex ? "ck-tip ck-tip--on" : "ck-tip"}
                >
                  <input
                    type="radio"
                    name={`tip-${cue}`}
                    checked={prep.tips[index] === tipIndex}
                    onChange={() => dispatch({ type: "pickTip", index, tip: tipIndex })}
                    data-testid={`tip-${cue}-${tipIndex}`}
                  />
                  {tip.text}
                </label>
              ))}
            </fieldset>
          );
        })}
      </div>
    </Dialog>
  );
}

export function CueCardsDialog({ state, prep, open, dispatch, onLive, onClose }: CueCardsDialogProps) {
  const focusAfter = useFocusAfterRender();
  if (!open || prep === null) return null;
  return (
    <Body
      state={state}
      prep={prep}
      dispatch={dispatch}
      onLive={onLive}
      onClose={() => {
        onClose();
        focusAfter(['[data-testid="open-cue-cards"]']);
      }}
      focusAfter={focusAfter}
    />
  );
}
