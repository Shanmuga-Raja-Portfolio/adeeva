import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useToast } from "../../../../../studio/ToastContext";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { isInsideElement } from "../../../../../ui/kit/clientToSvg";
import { Meter } from "../../../../../ui/kit/Meter";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { useDispatchOnce, type ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { KEMI_LOOK, KEMI_NAME } from "../../../content/panelMember";
import {
  canBuyGems,
  gemBudget,
  lineStoneNeeds,
  picksCost,
  potCovers,
  stoneById,
  tintById,
  type Action,
  type CollectionState,
  type GameState,
  type GemStone,
} from "../../../core";
import { GemArt } from "../../art/GemArt";
import { useTintLabels } from "../../useTintLabels";
import { LoftHeader } from "../loft/LoftHeader";
import "../bench/bench.css";
import "../loft/loft.css";
import "./gems.css";

export interface GemMarketProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

const COLUMNS = 4;
const HOLD_MS = 380;
const MOVE_THRESHOLD = 6;

interface Drag {
  readonly index: number;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly x: number;
  readonly y: number;
  readonly moved: boolean;
}

function stoneLabel(stone: GemStone): string {
  const tint = tintById(stone.tint);
  return `${stoneById(stone.stoneId).name}, ${tint.word} tint ${tint.pattern}, shimmer ${stone.shimmer}, ${stone.price} coins`;
}

function Loupe({ stone }: { readonly stone: GemStone }) {
  const tint = tintById(stone.tint);
  return (
    <div className="jb-gem-loupe" role="status" data-testid="gem-loupe">
      <svg viewBox="-60 -60 120 120" aria-hidden="true">
        <circle r={58} fill="#fffbf4" stroke="#b8741c" strokeWidth={4} />
        <GemArt stoneId={stone.stoneId} tint={stone.tint} shimmer={stone.shimmer} size={78} pattern />
      </svg>
      <strong>{stoneById(stone.stoneId).name}</strong>
      <span>
        {tint.pattern} {tint.word} tint · Shimmer {"◇".repeat(stone.shimmer)}
      </span>
      <span>{stone.price} coins</span>
    </div>
  );
}

function MarketView({
  state,
  dispatch,
  onExit,
  collection,
}: GemMarketProps & { readonly collection: CollectionState }) {
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const [pot, setPot] = useState<readonly number[]>([]);
  const [held, setHeld] = useState<number | null>(null);
  const [loupe, setLoupe] = useState<number | null>(null);
  const [focus, setFocus] = useState(0);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [labels, setLabels] = useTintLabels(state.profile.difficulty);
  const potRef = useRef<HTMLDivElement | null>(null);
  const stoneRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const holdTimer = useRef<number | null>(null);
  const brief = collection.brief;
  const launch = state.launch;
  if (brief === null || launch === null) return null;
  const budget = gemBudget(brief, launch.spot);
  const cost = picksCost(collection, pot);
  const needs = [...lineStoneNeeds(brief).entries()];
  const check = canBuyGems(state, pot);
  const covers = potCovers(collection, pot);
  const tray = collection.gemTray;

  const addToPot = (index: number) => {
    const stone = tray[index];
    if (stone === undefined || pot.includes(index)) return;
    if (cost + stone.price > budget) {
      setHint(`That would go over the ${budget}-coin stone budget.`);
      return;
    }
    const need = lineStoneNeeds(brief).get(stone.stoneId) ?? 0;
    const have = pot.filter((entry) => tray[entry]?.stoneId === stone.stoneId).length;
    if (have >= need) {
      setHint(
        `The line only needs ${need} ${stoneById(stone.stoneId).name} ${need === 1 ? "stone" : "stones"}.`,
      );
      return;
    }
    setHint(null);
    setPot([...pot, index]);
    setHeld(null);
  };
  const removeFromPot = (index: number) => {
    setPot(pot.filter((entry) => entry !== index));
    setHint(null);
  };
  const clearHold = () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };
  const begin = (event: PointerEvent<HTMLButtonElement>, index: number) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    });
    clearHold();
    holdTimer.current = window.setTimeout(() => setLoupe(index), HOLD_MS);
  };
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag === null || drag.pointerId !== event.pointerId) return;
    const moved =
      drag.moved || Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > MOVE_THRESHOLD;
    if (moved) clearHold();
    setDrag({ ...drag, x: event.clientX, y: event.clientY, moved });
  };
  const end = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag === null || drag.pointerId !== event.pointerId) return;
    clearHold();
    const wasLoupe = loupe !== null;
    setDrag(null);
    setLoupe(null);
    if (wasLoupe) return;
    if (drag.moved) {
      if (isInsideElement(potRef.current, event.clientX, event.clientY)) addToPot(drag.index);
      return;
    }
    if (pot.includes(drag.index)) removeFromPot(drag.index);
    else setHeld(held === drag.index ? null : drag.index);
  };
  const keyOnStone = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -COLUMNS,
      ArrowDown: COLUMNS,
    };
    const delta = moves[event.key];
    if (delta !== undefined) {
      event.preventDefault();
      const next = Math.min(tray.length - 1, Math.max(0, index + delta));
      setFocus(next);
      stoneRefs.current[next]?.focus();
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (pot.includes(index)) removeFromPot(index);
      else addToPot(index);
    } else if (event.key === " ") {
      event.preventDefault();
      if (!event.repeat) setLoupe(index);
    }
  };
  const keyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " ") setLoupe(null);
  };
  const buy = (event: ClickLike) => {
    if (once(event, { type: "buyGems", picks: pot })) {
      toast(`${KEMI_NAME} wraps your stones in a velvet pouch. The Line Pot is full!`);
      onExit();
    }
  };
  const shown = loupe === null ? undefined : tray[loupe];
  const dragged = drag !== null && drag.moved ? tray[drag.index] : undefined;
  return (
    <main className="jb-gems ad-screen" data-testid="gem-market">
      <LoftHeader
        state={state}
        eyebrow="Thimble Lane Arcade"
        title="Pebble & Prism"
        onExit={onExit}
        exitLabel="Back to the loft"
      />
      <div className="jb-gems__layout">
        <section className="jb-gems__stall" aria-label="Kemi's velvet tray">
          <div className="jb-gems__kemi">
            <Avatar look={KEMI_LOOK} mood="happy" size={72} title={KEMI_NAME} frameColour="#fbe9c8" />
            <p>
              <strong>{KEMI_NAME}:</strong> Only stones your line can use today. Hold one to see it close up!
            </p>
          </div>
          <div
            className="jb-gems__tray"
            role="group"
            aria-label="Velvet tray of stones. Arrow keys move, Enter adds a stone to the pot or puts it back, hold Space for the loupe."
            data-testid="gem-tray"
          >
            {tray.map((stone, index) => {
              const inPot = pot.includes(index);
              const tint = tintById(stone.tint);
              return (
                <button
                  key={index}
                  ref={(element) => {
                    stoneRefs.current[index] = element;
                  }}
                  type="button"
                  className={[
                    "jb-gem",
                    inPot ? "jb-gem--in-pot" : "",
                    held === index ? "jb-gem--held" : "",
                    drag?.index === index && drag.moved ? "jb-gem--dragging" : "",
                  ]
                    .filter((name) => name.length > 0)
                    .join(" ")}
                  tabIndex={focus === index ? 0 : -1}
                  aria-label={stoneLabel(stone)}
                  aria-pressed={inPot}
                  onFocus={() => setFocus(index)}
                  onPointerDown={(event) => begin(event, index)}
                  onPointerMove={move}
                  onPointerUp={end}
                  onPointerCancel={() => {
                    clearHold();
                    setDrag(null);
                    setLoupe(null);
                  }}
                  onKeyDown={(event) => keyOnStone(event, index)}
                  onKeyUp={keyUp}
                  onBlur={() => setLoupe(null)}
                  data-testid={`gem-${index}`}
                  data-tint={stone.tint}
                  data-stone={stone.stoneId}
                  data-price={stone.price}
                >
                  <svg viewBox="-24 -24 48 48" aria-hidden="true">
                    <GemArt
                      stoneId={stone.stoneId}
                      tint={stone.tint}
                      shimmer={stone.shimmer}
                      size={38}
                      pattern={labels}
                    />
                  </svg>
                  {labels ? (
                    <span className="jb-gem__tint">
                      {tint.pattern} {tint.word}
                    </span>
                  ) : null}
                  <span className="jb-gem__price">{stone.price}</span>
                </button>
              );
            })}
          </div>
          <ToggleSwitch
            label="Tint labels"
            description="Show each stone's tint word and pattern on the tray."
            checked={labels}
            onChange={setLabels}
          />
        </section>
        <aside className="jb-gems__side">
          <div
            ref={potRef}
            className={held !== null ? "jb-line-pot jb-line-pot--ready" : "jb-line-pot"}
            role="button"
            tabIndex={held !== null ? 0 : -1}
            aria-label={held !== null ? "Drop the stone into the Line Pot" : "Line Pot"}
            onClick={() => {
              if (held !== null) addToPot(held);
            }}
            onKeyDown={(event) => {
              if ((event.key === "Enter" || event.key === " ") && held !== null) {
                event.preventDefault();
                addToPot(held);
              }
            }}
            data-testid="line-pot"
          >
            <h2>Line Pot</h2>
            <ul className="jb-line-pot__needs">
              {needs.map(([stoneId, need]) => {
                const have = pot.filter((index) => tray[index]?.stoneId === stoneId).length;
                return (
                  <li key={stoneId} className={have >= need ? "is-full" : undefined}>
                    {stoneById(stoneId).name}: {have} of {need}
                  </li>
                );
              })}
            </ul>
            <div className="jb-line-pot__stones">
              {pot.length === 0 ? (
                <p className="jb-muted">Drag stones here, or tap a stone then tap the pot.</p>
              ) : null}
              {pot.map((index) => {
                const stone = tray[index];
                if (stone === undefined) return null;
                return (
                  <button
                    key={index}
                    type="button"
                    className="jb-gem jb-gem--potted"
                    aria-label={`Put back ${stoneLabel(stone)}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeFromPot(index);
                    }}
                    data-testid={`pot-gem-${index}`}
                  >
                    <svg viewBox="-24 -24 48 48" aria-hidden="true">
                      <GemArt
                        stoneId={stone.stoneId}
                        tint={stone.tint}
                        shimmer={stone.shimmer}
                        size={30}
                        pattern
                      />
                    </svg>
                    <span className="jb-gem__tint">
                      {tintById(stone.tint).pattern} {tintById(stone.tint).word}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <Meter
            label="Stone budget"
            value={cost}
            max={budget}
            valueText={`${cost} of ${budget} coins`}
            tone="gold"
          />
          <p
            className={hint === null ? "jb-hint-line" : "jb-hint-line jb-hint-line--warn"}
            aria-live="polite"
          >
            {hint ??
              (covers
                ? "Every seat has a stone. Matching tints make the line sing!"
                : "Fill every seat. Same-tint stones match best.")}
          </p>
          <Button
            size="lg"
            icon="check"
            onClick={buy}
            disabledReason={check.ok ? undefined : check.reasons[0]}
            showReason
            data-testid="buy-gems"
          >
            Buy the Line Pot · 1 h
          </Button>
        </aside>
      </div>
      {shown !== undefined ? <Loupe stone={shown} /> : null}
      {dragged !== undefined && drag !== null ? (
        <div className="jb-gem-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          <svg viewBox="-24 -24 48 48">
            <GemArt
              stoneId={dragged.stoneId}
              tint={dragged.tint}
              shimmer={dragged.shimmer}
              size={34}
              pattern={labels}
            />
          </svg>
        </div>
      ) : null}
    </main>
  );
}

export function GemMarket(props: GemMarketProps) {
  const collection = props.state.collection;
  if (collection === null) return null;
  return <MarketView {...props} collection={collection} />;
}
