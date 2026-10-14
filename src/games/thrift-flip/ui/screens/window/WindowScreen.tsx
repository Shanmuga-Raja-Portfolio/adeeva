import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { Meter } from "../../../../../ui/kit/Meter";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { clientToSvg } from "../../../../../ui/kit/clientToSvg";
import { HINTS } from "../../../content/hint";
import { WINDOW_PROPS, type WindowPropId } from "../../../content/windowProp";
import {
  hangingPieces,
  propIssue,
  recipeById,
  scoreWindow,
  seasonTheme,
  signById,
  WINDOW_HEIGHT,
  WINDOW_HOURS,
  WINDOW_WIDTH,
  windowIssues,
  windowLimits,
  type Action,
  type GameState,
  type WindowDisplay,
} from "../../../core";
import { pieceCloth } from "../../art/findCloth";
import { ProductPreview } from "../../art/ProductPreview";
import { PropArt } from "../../art/PropArt";
import { LeaveDraftDialog } from "../boutique/LeaveDraftDialog";
import { WindowScene, type WindowItemKey } from "../boutique/WindowScene";
import "./window.css";

export interface WindowScreenProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

interface Drag {
  readonly key: WindowItemKey;
  readonly pointerId: number;
  readonly dx: number;
  readonly dy: number;
}

const NUDGE = 12;
const BIG_NUDGE = 36;
const SPOTS_X = [100, 300, 500, 200, 400];

function clampSpot(x: number, y: number): { readonly x: number; readonly y: number } {
  return {
    x: Math.round(Math.min(WINDOW_WIDTH - 40, Math.max(40, x))),
    y: Math.round(Math.min(WINDOW_HEIGHT - 60, Math.max(60, y))),
  };
}

function freeSpot(display: WindowDisplay, row: number): { readonly x: number; readonly y: number } {
  const taken = [...display.pieces, ...display.props];
  const x = SPOTS_X.find((candidate) => !taken.some((spot) => Math.abs(spot.x - candidate) < 60)) ?? 300;
  return { x, y: row };
}

function itemSpot(display: WindowDisplay, key: WindowItemKey) {
  const [kind, id] = key.split(":");
  return kind === "piece"
    ? display.pieces.find((entry) => entry.pieceId === id)
    : display.props.find((entry) => entry.propId === id);
}

function moveItem(display: WindowDisplay, key: WindowItemKey, x: number, y: number): WindowDisplay {
  const [kind, id] = key.split(":");
  const spot = clampSpot(x, y);
  if (kind === "piece")
    return {
      ...display,
      pieces: display.pieces.map((entry) => (entry.pieceId === id ? { ...entry, ...spot } : entry)),
    };
  return {
    ...display,
    props: display.props.map((entry) => (entry.propId === id ? { ...entry, ...spot } : entry)),
  };
}

function withoutItem(display: WindowDisplay, key: WindowItemKey): WindowDisplay {
  const [kind, id] = key.split(":");
  return kind === "piece"
    ? { ...display, pieces: display.pieces.filter((entry) => entry.pieceId !== id) }
    : { ...display, props: display.props.filter((entry) => entry.propId !== id) };
}

export function WindowScreen({ state, dispatch, onExit }: WindowScreenProps) {
  const toast = useToast();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const boutique = state.boutique;
  const [draft, setDraft] = useState<WindowDisplay>(() => boutique?.window ?? { pieces: [], props: [] });
  const [selected, setSelected] = useState<WindowItemKey | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [leaving, setLeaving] = useState(false);
  if (boutique === null) return null;
  const rack = hangingPieces(state);
  const limits = windowLimits(state);
  const season = seasonTheme(state);
  const score = scoreWindow(state, draft);
  const issues = windowIssues(state, draft);
  const unchanged = JSON.stringify(draft) === JSON.stringify(boutique.window);
  const signName = signById(boutique.signId).name;

  const addPiece = (pieceId: string) => {
    if (draft.pieces.length >= limits.pieces) return;
    const spot = freeSpot(draft, 250);
    setDraft({ ...draft, pieces: [...draft.pieces, { pieceId, ...spot }] });
    setSelected(`piece:${pieceId}`);
  };

  const addProp = (propId: WindowPropId) => {
    if (draft.props.length >= limits.props) return;
    const spot = freeSpot(draft, 110);
    setDraft({ ...draft, props: [...draft.props, { propId, ...spot }] });
    setSelected(`prop:${propId}`);
  };

  const nudge = (dx: number, dy: number) => {
    if (selected === null) return;
    const spot = itemSpot(draft, selected);
    if (spot === undefined) return;
    setDraft(moveItem(draft, selected, spot.x + dx, spot.y + dy));
  };

  const remove = () => {
    if (selected === null) return;
    setDraft(withoutItem(draft, selected));
    setSelected(null);
  };

  const onItemDown = (event: PointerEvent<SVGGElement>, key: WindowItemKey) => {
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    const spot = itemSpot(draft, key);
    if (point === null || spot === undefined) return;
    event.preventDefault();
    svgRef.current?.setPointerCapture(event.pointerId);
    setSelected(key);
    setDrag({ key, pointerId: event.pointerId, dx: spot.x - point.x, dy: spot.y - point.y });
  };

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (drag === null || event.pointerId !== drag.pointerId) return;
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    if (point === null) return;
    setDraft((current) => moveItem(current, drag.key, point.x + drag.dx, point.y + drag.dy));
  };

  const onUp = (event: PointerEvent<HTMLDivElement>) => {
    if (drag !== null && event.pointerId === drag.pointerId) setDrag(null);
  };

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? BIG_NUDGE : NUDGE;
    const moves: Readonly<Record<string, readonly [number, number]>> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (move !== undefined && selected !== null) {
      event.preventDefault();
      nudge(move[0], move[1]);
    }
    if ((event.key === "Delete" || event.key === "Backspace") && selected !== null) {
      event.preventDefault();
      remove();
    }
  };

  const commit = () => {
    if (dispatch({ type: "dressWindow", pieces: draft.pieces, props: draft.props }))
      toast("The window is dressed! It stays up until you change it.");
  };

  const buy = (propId: WindowPropId) => {
    if (dispatch({ type: "buyProp", propId })) toast("A new prop for the window!");
  };

  return (
    <main className="tf-window-screen ad-screen" data-testid="window-screen">
      <header className="tf-window-screen__head">
        <Button
          variant="secondary"
          icon="back"
          onClick={() => (unchanged ? onExit() : setLeaving(true))}
          data-testid="window-back"
        >
          Back to the shop
        </Button>
        <div>
          <span className="ad-eyebrow">
            {signName} · {season?.name ?? "This season"}
          </span>
          <h1>Dress the window</h1>
        </div>
        <div className="tf-window-screen__stats">
          <StatChip kind="hours" value={`${state.calendar.hoursLeft} h`} />
          <StatChip kind="coins" value={state.coins} />
        </div>
      </header>
      <p className="tf-hint">
        <Icon name="sparkle" size={18} />
        {HINTS.window}
      </p>
      <div className="tf-window-screen__body">
        <div
          className="tf-window-screen__stage"
          tabIndex={0}
          onKeyDown={onKey}
          aria-label="Shop window. Arrow keys move the chosen item."
        >
          <div
            className="tf-window-screen__frame"
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            <WindowScene
              display={draft}
              rack={state.rack}
              season={season}
              signName={signName}
              title="Your shop window"
              selected={selected}
              svgRef={svgRef}
              onItemDown={onItemDown}
              className="tf-window-screen__scene"
            />
          </div>
          <div className="tf-window-screen__controls" aria-label="Move the chosen item">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => nudge(-BIG_NUDGE, 0)}
              disabled={selected === null}
              aria-label="Move left"
            >
              ←
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => nudge(0, -BIG_NUDGE)}
              disabled={selected === null}
              aria-label="Move up"
            >
              ↑
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => nudge(0, BIG_NUDGE)}
              disabled={selected === null}
              aria-label="Move down"
            >
              ↓
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => nudge(BIG_NUDGE, 0)}
              disabled={selected === null}
              aria-label="Move right"
            >
              →
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={remove}
              disabled={selected === null}
              data-testid="window-remove"
            >
              Take out
            </Button>
          </div>
        </div>
        <aside className="tf-window-screen__side">
          <section className="tf-window-score" aria-label="Window score" data-testid="window-score">
            <div className="tf-window-score__total">
              <span className="ad-eyebrow">Window</span>
              <strong data-testid="window-total">{score.total}</strong>
              <span>+{score.buzz} buzz on Till Day</span>
            </div>
            <Meter label="Season feel" value={score.theme} tone="rose" />
            <Meter label="Season colours" value={score.colour} tone="gold" />
            <Meter label="Left, middle and right" value={score.balance} tone="sage" />
            <Meter label="Leaves" value={score.leaves} tone="sage" />
          </section>
          <section className="tf-window-tray" aria-label="Pieces on the rack">
            <h2>
              Pieces · {draft.pieces.length}/{limits.pieces}
            </h2>
            {rack.length === 0 ? <p className="ad-muted">Make a piece for the rack first.</p> : null}
            <div className="tf-window-tray__items">
              {rack.map((piece) => {
                const shown = draft.pieces.some((entry) => entry.pieceId === piece.id);
                return (
                  <button
                    key={piece.id}
                    type="button"
                    className={shown ? "tf-window-chip is-shown" : "tf-window-chip"}
                    disabled={!shown && draft.pieces.length >= limits.pieces}
                    onClick={() => (shown ? setSelected(`piece:${piece.id}`) : addPiece(piece.id))}
                    data-testid={`window-add-${piece.id}`}
                    aria-label={
                      shown
                        ? `Select the ${recipeById(piece.recipeId).name}`
                        : `Put the ${recipeById(piece.recipeId).name} in the window`
                    }
                  >
                    <ProductPreview
                      design={piece.design}
                      cloth={pieceCloth(piece.id, piece.cloth)}
                      finishes={piece.finishes}
                      title={recipeById(piece.recipeId).name}
                      className="tf-window-chip__art"
                    />
                    <span>{recipeById(piece.recipeId).name}</span>
                  </button>
                );
              })}
            </div>
          </section>
          <section className="tf-window-tray" aria-label="Props">
            <h2>
              Props · {draft.props.length}/{limits.props}
            </h2>
            <div className="tf-window-tray__items">
              {WINDOW_PROPS.map((prop) => {
                const owned = boutique.props.includes(prop.id);
                const shown = draft.props.some((entry) => entry.propId === prop.id);
                const issue = propIssue(state, prop.id);
                return (
                  <div key={prop.id} className={owned ? "tf-prop-card is-owned" : "tf-prop-card"}>
                    <svg viewBox="-45 -45 90 90" className="tf-prop-card__art" aria-hidden="true">
                      <PropArt propId={prop.id} />
                    </svg>
                    <span className="tf-prop-card__name">{prop.name}</span>
                    {owned ? (
                      <Button
                        size="sm"
                        variant={shown ? "ghost" : "secondary"}
                        disabled={!shown && draft.props.length >= limits.props}
                        onClick={() => (shown ? setSelected(`prop:${prop.id}`) : addProp(prop.id))}
                        data-testid={`window-prop-${prop.id}`}
                      >
                        {shown ? "In the window" : "Put in"}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => buy(prop.id)}
                        disabledReason={issue ?? undefined}
                        data-testid={`buy-prop-${prop.id}`}
                      >
                        <Icon name="coin" size={14} /> {prop.price}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
      <footer className="tf-window-screen__foot">
        <span className="ad-muted" aria-live="polite">
          {unchanged
            ? "The window looks like this now."
            : (issues[0] ?? "Ready! Dressing the window takes an hour.")}
        </span>
        <Button
          size="lg"
          icon="sparkle"
          onClick={commit}
          disabledReason={unchanged ? "Move something first." : issues[0]}
          data-testid="dress-window"
        >
          Dress the window
          <span className="tf-footer__hours">
            <Icon name="clock" size={14} /> {WINDOW_HOURS} h
          </span>
        </Button>
      </footer>
      <LeaveDraftDialog
        open={leaving}
        title="Leave without dressing the window?"
        detail="Your new arrangement isn't up yet. If you leave now, the window stays as it was."
        stayLabel="Keep arranging"
        onStay={() => setLeaving(false)}
        onLeave={onExit}
      />
    </main>
  );
}
