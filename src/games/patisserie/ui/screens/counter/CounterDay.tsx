import { useCallback, useRef, useState, type PointerEvent } from "react";
import { colourById } from "../../../../../engine/palette";
import { useSettings } from "../../../../../studio/SettingsContext";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import {
  boxAccepts,
  boxPay,
  COUNTER_SECONDS,
  kindKey,
  productById,
  type Action,
  type CounterTray,
  type GameState,
  type TrayKind,
} from "../../../core";
import { TreatIcon } from "../../art/TreatIcon";
import { SunsetDialog } from "./SunsetDialog";
import { useCounterClock } from "./useCounterClock";
import "./counter.css";
import "./compact.css";

export interface CounterDayProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

const CLOSING_WARNING_SECONDS = 20;

interface Carry {
  readonly trayId: string;
  readonly pointerId: number;
  readonly x: number;
  readonly y: number;
}

export function CounterDay({ state, dispatch, onExit }: CounterDayProps) {
  const toast = useToast();
  const { reducedMotion } = useSettings();
  const session = state.counter.session;
  const [boxes, setBoxes] = useState<Readonly<Record<number, readonly string[]>>>({});
  const [held, setHeld] = useState<string | null>(null);
  const [carry, setCarry] = useState<Carry | null>(null);
  const [bounced, setBounced] = useState<number | null>(null);
  const boxRefs = useRef<Record<number, HTMLElement | null>>({});
  const close = useCallback(() => {
    if (dispatch({ type: "closeCounter" }))
      toast("Counter closed. Leftovers went to the neighbours!", "info");
    onExit();
  }, [dispatch, onExit, toast]);
  const [sunset, setSunset] = useState(false);
  const sundown = useCallback(() => setSunset(true), []);
  const limit = state.profile.difficulty === "relaxed" ? null : COUNTER_SECONDS;
  const elapsed = useCounterClock(limit, sundown);
  if (session === null) return null;
  const trays = state.counter.trays;
  const boxed = (trayId: string) =>
    Object.values(boxes).reduce((sum, ids) => sum + ids.filter((id) => id === trayId).length, 0);
  const trayOf = (trayId: string): CounterTray | undefined => trays.find((tray) => tray.id === trayId);
  const kindOf = (trayId: string): TrayKind | null => {
    const tray = trayOf(trayId);
    return tray === undefined ? null : { productId: tray.productId, colour: tray.colour };
  };

  const drop = (cardIndex: number, trayId: string) => {
    const card = session.cards[cardIndex];
    const kind = kindOf(trayId);
    if (card === undefined || kind === null || session.sold.includes(cardIndex)) return;
    const current = boxes[cardIndex] ?? [];
    const placed = current.flatMap((id) => {
      const placedKind = kindOf(id);
      return placedKind === null ? [] : [placedKind];
    });
    if (!boxAccepts(card, placed, kind)) {
      setBounced(cardIndex);
      toast("That box needs something else.", "info");
      return;
    }
    const next = [...current, trayId];
    setHeld(null);
    if (next.length === card.items.length) {
      if (dispatch({ type: "sellBox", cardIndex, trayIds: next })) {
        const pay = boxPay(
          state,
          next.flatMap((id) => {
            const tray = trayOf(id);
            return tray === undefined ? [] : [tray];
          }),
        );
        toast(`Box sold! +${pay} coins`);
        setBoxes((all) =>
          Object.fromEntries(Object.entries(all).filter(([key]) => Number(key) !== cardIndex)),
        );
      }
      return;
    }
    setBoxes((all) => ({ ...all, [cardIndex]: next }));
  };

  const emptyBox = (cardIndex: number) =>
    setBoxes((all) => Object.fromEntries(Object.entries(all).filter(([key]) => Number(key) !== cardIndex)));

  const down = (event: PointerEvent<HTMLButtonElement>, trayId: string) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setHeld(trayId);
    setCarry({ trayId, pointerId: event.pointerId, x: event.clientX, y: event.clientY });
  };
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (carry === null || carry.pointerId !== event.pointerId) return;
    setCarry({ ...carry, x: event.clientX, y: event.clientY });
  };
  const up = (event: PointerEvent<HTMLButtonElement>) => {
    if (carry === null || carry.pointerId !== event.pointerId) return;
    setCarry(null);
    const hit = Object.entries(boxRefs.current).find(([, element]) => {
      if (element === null) return false;
      const rect = element.getBoundingClientRect();
      return (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
    });
    if (hit !== undefined) drop(Number(hit[0]), carry.trayId);
  };

  const sunShare = limit === null ? 0.5 : Math.min(1, elapsed / limit);
  const closingSoon = limit !== null && !sunset && limit - elapsed <= CLOSING_WARNING_SECONDS;
  const treatsLeft = trays.reduce((sum, tray) => sum + tray.left, 0);
  const carried = carry === null ? null : kindOf(carry.trayId);
  return (
    <main className="pa-counter ad-screen" data-testid="counter-day">
      <header className="pa-counter__top">
        <div>
          <span className="ad-eyebrow">Counter Day · Box It Up</span>
          <h1>Fill each box with the treats on its card</h1>
        </div>
        <div className="pa-counter__earned" data-testid="counter-coins">
          <Icon name="coin" size={20} /> +{session.coins}
        </div>
        <Button variant="secondary" onClick={close} data-testid="close-shop">
          Close shop
        </Button>
      </header>
      <div className="pa-counter__window" aria-hidden="true">
        {limit === null ? null : reducedMotion ? (
          <div className="pa-counter__sunbar">
            <span style={{ width: `${(1 - sunShare) * 100}%` }} />
          </div>
        ) : (
          <span
            className="pa-counter__sun"
            style={{ left: `${8 + sunShare * 84}%`, top: `${48 - Math.sin(sunShare * Math.PI) * 34}%` }}
          />
        )}
        <div className="pa-counter__street" />
      </div>
      <section className="pa-counter__cards" aria-label="Order cards">
        {session.cards.map((card, cardIndex) => {
          const sold = session.sold.includes(cardIndex);
          const inBox = boxes[cardIndex] ?? [];
          return (
            <article
              key={cardIndex}
              className={[
                "pa-card",
                sold ? "pa-card--sold" : "",
                bounced === cardIndex ? "pa-card--bounce" : "",
              ].join(" ")}
              onAnimationEnd={() => setBounced(null)}
              data-testid={`order-box-${cardIndex}`}
              data-wants={card.items.map(kindKey).join(",")}
            >
              <div className="pa-card__wants">
                {card.items.map((item, index) => (
                  <TreatIcon
                    key={`${kindKey(item)}-${index}`}
                    productId={item.productId}
                    colour={colourById(item.colour).hex}
                    size={34}
                  />
                ))}
              </div>
              <button
                type="button"
                ref={(element) => {
                  boxRefs.current[cardIndex] = element;
                }}
                className="pa-card__box"
                disabled={sold}
                onClick={() => {
                  if (held !== null) drop(cardIndex, held);
                }}
                aria-label={
                  sold ? "Sold box" : `Box ${cardIndex + 1}, ${inBox.length} of ${card.items.length} in`
                }
              >
                {sold ? (
                  <span className="pa-card__ribbon">Sold!</span>
                ) : (
                  inBox.map((id, index) => {
                    const kind = kindOf(id);
                    return kind === null ? null : (
                      <TreatIcon
                        key={`${id}-${index}`}
                        productId={kind.productId}
                        colour={colourById(kind.colour).hex}
                        size={30}
                      />
                    );
                  })
                )}
              </button>
              {!sold && inBox.length > 0 ? (
                <button type="button" className="pa-card__empty" onClick={() => emptyBox(cardIndex)}>
                  Empty box
                </button>
              ) : null}
            </article>
          );
        })}
      </section>
      <section className="pa-counter__glass" aria-label="Trays on the counter">
        {trays.map((tray) => {
          const left = tray.left - boxed(tray.id);
          return (
            <div key={tray.id} className="pa-counter__tray">
              <span className="pa-counter__tray-name">
                {productById(tray.productId).name} · {colourById(tray.colour).name}
                {tray.tags.some((tag) => state.trends.current.includes(tag)) ? (
                  <span className="pa-counter__hot"> Town favourite +1</span>
                ) : null}
              </span>
              <div className="pa-counter__items">
                {Array.from({ length: Math.max(0, left) }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={held === tray.id && index === 0 ? "pa-treat pa-treat--held" : "pa-treat"}
                    onPointerDown={(event) => down(event, tray.id)}
                    onPointerMove={move}
                    onPointerUp={up}
                    onPointerCancel={() => setCarry(null)}
                    onClick={(event) => {
                      if (event.detail === 0) setHeld(tray.id);
                    }}
                    aria-label={`${colourById(tray.colour).name} ${productById(tray.productId).name} treat`}
                    data-testid={`treat-${tray.id}`}
                  >
                    <TreatIcon productId={tray.productId} colour={colourById(tray.colour).hex} size={44} />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </section>
      <p className="pa-hint pa-counter__hint">
        Drag a treat into a box, or tap a treat and then tap a box. Mixed boxes earn a little extra.{" "}
        {limit === null
          ? "No one is waiting, so take your time."
          : "No one is waiting, but the shop closes when the sun sets."}
      </p>
      <p className="pa-counter__closing" role="status" data-testid="closing-soon">
        {closingSoon ? "The sun is setting. Almost closing time!" : ""}
      </p>
      <SunsetDialog
        open={sunset}
        boxes={session.sold.length}
        coins={session.coins}
        treatsLeft={treatsLeft}
        onClose={close}
      />
      {carry !== null && carried !== null ? (
        <div
          className="pa-drag-ghost pa-drag-ghost--treat"
          style={{ transform: `translate(${carry.x - 28}px, ${carry.y - 28}px)` }}
          aria-hidden="true"
        >
          <TreatIcon productId={carried.productId} colour={colourById(carried.colour).hex} size={56} />
        </div>
      ) : null}
    </main>
  );
}
