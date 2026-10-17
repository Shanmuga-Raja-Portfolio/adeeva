import { useCallback, useRef, useState, type PointerEvent } from "react";
import { colourById } from "../../../../../engine/palette";
import { useSettings } from "../../../../../studio/SettingsContext";
import { useToast } from "../../../../../studio/ToastContext";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { MENU_TIERS, type MenuTierId } from "../../../content/menuTier";
import {
  canServeTable,
  clientById,
  itemName,
  menuTierById,
  platingRefusal,
  SALON_SECONDS,
  tablePay,
  tablePayLines,
  teaBand,
  teaById,
  type Action,
  type GameState,
} from "../../../core";
import { TreatIcon } from "../../art/TreatIcon";
import { useAssist } from "../../useAssist";
import { useCounterClock } from "../counter/useCounterClock";
import { CloseSalonDialog } from "./CloseSalonDialog";
import { StandPlating, type HeldItem } from "./StandPlating";
import { TeaPourStation } from "./TeaPourStation";
import { TeaTins } from "./TeaTins";
import { HELPER_NOTE } from "../bake/stageNames";
import "../bake/bake.css";
import "../bake/weigh.css";
import "../counter/counter.css";
import "./salon.css";

export interface TableServiceProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

interface Carry extends HeldItem {
  readonly pointerId: number;
  readonly x: number;
  readonly y: number;
}

const CLOSING_WARNING_SECONDS = 20;

export function TableService({ state, dispatch, onExit }: TableServiceProps) {
  const toast = useToast();
  const { reducedMotion } = useSettings();
  const [assist, setAssist] = useAssist("tea");
  const salon = state.salon;
  const session = salon?.session ?? null;
  const firstOpen = Math.max(0, session?.tables.findIndex((table) => !table.served) ?? 0);
  const [picked, setPicked] = useState<number | null>(null);
  const [held, setHeld] = useState<HeldItem | null>(null);
  const [carry, setCarry] = useState<Carry | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const slots = useRef<Partial<Record<MenuTierId, HTMLButtonElement | null>>>({});
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const close = useCallback(() => {
    if (dispatch({ type: "closeTables" }))
      toast("The Comet Room is closed for today. Leftovers go to the counter!", "info");
    onExit();
  }, [dispatch, onExit, toast]);
  const [sunset, setSunset] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const sundown = useCallback(() => setSunset(true), []);
  const limit = state.profile.difficulty === "relaxed" ? null : SALON_SECONDS;
  const elapsed = useCounterClock(limit, sundown);
  if (salon === null || session === null || salon.menu === null) return null;
  const tableIndex = picked !== null && session.tables[picked] !== undefined ? picked : firstOpen;
  const table = session.tables[tableIndex];
  const booking = salon.bookings[tableIndex];
  if (table === undefined || booking === undefined) return null;
  const firstTea = teaById(booking.teas[0]);
  const secondTea = teaById(booking.teas[1]);
  const serve = canServeTable(state, tableIndex);

  const place = (tier: MenuTierId, item: HeldItem) => {
    const refusal = platingRefusal(state, tableIndex, tier, item.tier, item.colour);
    if (refusal !== null) {
      setNotice(refusal);
      return;
    }
    if (dispatch({ type: "plateItem", tableIndex, tier, colour: item.colour })) {
      setHeld(null);
      setNotice(
        item.colour === booking.colours[tier]
          ? null
          : `Table ${tableIndex + 1} will love the surprise colour!`,
      );
    }
  };
  const tapSlot = (tier: MenuTierId) => {
    if (table.plated[tier] !== undefined) {
      dispatch({ type: "unplateItem", tableIndex, tier });
      return;
    }
    if (held !== null) place(tier, held);
    else setNotice(`Pick a ${menuTierById(tier).name.toLowerCase()} treat from the shelf first.`);
  };
  const down = (event: PointerEvent<HTMLButtonElement>, item: HeldItem) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setHeld(item);
    setCarry({ ...item, pointerId: event.pointerId, x: event.clientX, y: event.clientY });
  };
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (carry === null || carry.pointerId !== event.pointerId) return;
    setCarry({ ...carry, x: event.clientX, y: event.clientY });
  };
  const up = (event: PointerEvent<HTMLButtonElement>) => {
    if (carry === null || carry.pointerId !== event.pointerId) return;
    setCarry(null);
    const hit = MENU_TIERS.find((tier) => {
      const rect = slots.current[tier.id]?.getBoundingClientRect();
      return (
        rect !== undefined &&
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
    });
    if (hit !== undefined) place(hit.id, carry);
  };
  const serveNow = () => {
    const pay = tablePay(state, table);
    if (!dispatch({ type: "serveTable", tableIndex })) return;
    toast(`Table ${tableIndex + 1} is served! +${pay} coins`);
    setNotice(null);
    setPicked(null);
    const next = session.tables.findIndex((entry, index) => index !== tableIndex && !entry.served);
    tabs.current[next < 0 ? tableIndex : next]?.focus();
  };
  const sunShare = limit === null ? 0.5 : Math.min(1, elapsed / limit);
  const closingSoon = limit !== null && !sunset && limit - elapsed <= CLOSING_WARNING_SECONDS;
  const served = session.tables.filter((entry) => entry.served).length;
  const waiting = session.tables.length - served;
  const askToClose = () => {
    if (waiting === 0) close();
    else setConfirming(true);
  };
  return (
    <main className="pa-salon ad-screen" data-testid="table-service">
      <header className="pa-salon__top">
        <div>
          <span className="ad-eyebrow">Salon Day · The Comet Room</span>
          <h1>Plate each stand, pour the tea, then serve</h1>
        </div>
        <div className="pa-salon__earned" data-testid="salon-coins">
          <Icon name="coin" size={20} /> +{session.coins}
        </div>
        <Button variant="secondary" onClick={askToClose} data-testid="close-salon">
          Close the salon
        </Button>
      </header>
      <div className="pa-counter__window pa-salon__window" aria-hidden="true">
        {limit === null ? null : reducedMotion ? (
          <div className="pa-counter__sunbar pa-salon__sunbar">
            <span style={{ width: `${(1 - sunShare) * 100}%` }} />
          </div>
        ) : (
          <span
            className="pa-counter__sun"
            style={{ left: `${8 + sunShare * 84}%`, top: `${48 - Math.sin(sunShare * Math.PI) * 34}%` }}
          />
        )}
        <div className="pa-counter__street" />
        <span className="pa-salon__bunting" />
      </div>
      <nav className="pa-salon__tables" aria-label="Tables">
        {salon.bookings.map((entry, index) => {
          const guest = clientById(entry.guestId);
          const done = session.tables[index]?.served === true;
          return (
            <button
              key={entry.guestId}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              type="button"
              aria-pressed={index === tableIndex}
              className={done ? "pa-table-tab pa-table-tab--served" : "pa-table-tab"}
              onClick={() => {
                setPicked(index);
                setNotice(null);
              }}
              data-testid={`table-tab-${index}`}
            >
              {guest !== undefined ? <Avatar look={guest.look} size={36} title={guest.guestName} /> : null}
              <span>
                Table {index + 1}
                {done ? <Icon name="check" size={14} /> : null}
              </span>
            </button>
          );
        })}
        <span className="pa-salon__served">
          {served} of {session.tables.length} served
        </span>
      </nav>
      <div className="pa-salon__layout">
        <section className="pa-salon__shelf pa-doily" aria-label="Salon shelf">
          <h2>Salon shelf</h2>
          {MENU_TIERS.map((tier) => {
            const tray = salon.shelf.find((entry) => entry.tier === tier.id);
            const entry = salon.menu?.[tier.id];
            if (entry === undefined) return null;
            return (
              <div key={tier.id} className="pa-salon__tray">
                <span className="ad-eyebrow">
                  {tier.name} · {itemName(salon, tier.id)}
                </span>
                <div className="pa-salon__items">
                  {tray === undefined ? (
                    <span className="pa-muted">No tray baked</span>
                  ) : (
                    entry.colours.map((colour, index) => {
                      const left = tray.left[index] ?? 0;
                      const item = { tier: tier.id, colour };
                      const isHeld = held !== null && held.tier === tier.id && held.colour === colour;
                      return (
                        <button
                          key={colour}
                          type="button"
                          className={isHeld ? "pa-salon-treat pa-salon-treat--held" : "pa-salon-treat"}
                          disabled={left === 0 || table.served}
                          onPointerDown={(event) => down(event, item)}
                          onPointerMove={move}
                          onPointerUp={up}
                          onPointerCancel={() => setCarry(null)}
                          onClick={(event) => {
                            if (event.detail === 0) setHeld(isHeld ? null : item);
                          }}
                          aria-pressed={isHeld}
                          aria-label={`${colourById(colour).name} ${itemName(salon, tier.id).toLowerCase()}, ${left} left`}
                          data-testid={`shelf-${tier.id}-${colour}`}
                        >
                          <TreatIcon productId={entry.productId} colour={colourById(colour).hex} size={48} />
                          <span className="pa-salon-treat__count">×{left}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </section>
        <section className="pa-salon__centre" aria-label={`Table ${tableIndex + 1}`}>
          <StandPlating
            salon={salon}
            tableIndex={tableIndex}
            booking={booking}
            table={table}
            held={held}
            silver={state.upgrades.includes("silver-stands")}
            slotRef={(tier) => (element) => {
              slots.current[tier] = element;
            }}
            onSlot={tapSlot}
          />
          <p className="pa-salon__notice" role="status" data-testid="salon-notice">
            {notice ?? (held === null ? "Drag a treat to its tier, or tap a treat and then a tier." : "")}
          </p>
        </section>
        <section className="pa-salon__side pa-doily" aria-label="Tea and serving">
          <h2>Tea for Table {tableIndex + 1}</h2>
          {table.served ? (
            <p className="pa-stand__served">Tea is poured and the stand is on the table.</p>
          ) : (
            <TeaPourStation
              key={`${tableIndex}-${assist ? "a" : "m"}`}
              tableIndex={tableIndex}
              tea={firstTea}
              band={teaBand(state)}
              assisted={assist}
              stored={table.pour}
              dispatch={dispatch}
            />
          )}
          <p className="pa-hint">
            The second cup, {secondTea.name}, fills itself to match. Tea is served warm.
          </p>
          <ToggleSwitch
            label="Steady pot"
            description={`The pot stops by itself at the line. ${HELPER_NOTE}`}
            checked={assist}
            onChange={setAssist}
          />
          <TeaTins state={state} dispatch={dispatch} />
          {!table.served ? (
            <div className="pa-salon__serve">
              <ul className="pa-salon__pay">
                {tablePayLines(state, table).map((line) => (
                  <li key={line.label}>
                    <span>{line.label}</span>
                    <strong>{line.amount >= 0 ? `+${line.amount}` : line.amount}</strong>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                icon="heart"
                onClick={serveNow}
                disabledReason={serve.ok ? undefined : serve.reasons[0]}
                showReason
                data-testid="serve-table"
              >
                Serve Table {tableIndex + 1}
              </Button>
            </div>
          ) : null}
        </section>
      </div>
      <p className="pa-salon__closing" role="status">
        {closingSoon ? "The afternoon is nearly over. Time to close soon!" : ""}
      </p>
      <CloseSalonDialog
        open={sunset || confirming}
        sunset={sunset}
        waiting={waiting}
        coins={session.coins}
        onClose={close}
        onKeep={() => setConfirming(false)}
      />
      {carry !== null ? (
        <div
          className="pa-drag-ghost pa-drag-ghost--treat"
          style={{ transform: `translate(${carry.x - 28}px, ${carry.y - 28}px)` }}
          aria-hidden="true"
        >
          <TreatIcon
            productId={salon.menu[carry.tier].productId}
            colour={colourById(carry.colour).hex}
            size={56}
          />
        </div>
      ) : null}
    </main>
  );
}
