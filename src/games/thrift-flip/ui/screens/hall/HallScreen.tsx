import { useState } from "react";
import { colourById } from "../../../../../engine/palette";
import { useToast } from "../../../../../studio/ToastContext";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { HINTS } from "../../../content/hint";
import { MENTOR_LOOK } from "../../../content/storyBeat";
import { SWAP_NEIGHBOURS } from "../../../content/swapNeighbour";
import {
  conditionById,
  findById,
  isWellMended,
  seasonTheme,
  swapIssue,
  swapLimit,
  TABLE_HOURS,
  tableDone,
  tableIssue,
  todaysSwapDay,
  wellMendedCount,
  type Action,
  type GameState,
  type SwapTable,
} from "../../../core";
import { FindArt } from "../../art/FindArt";
import { HallBackdrop } from "../../art/HallBackdrop";
import { TableWork } from "./TableWork";
import "./hall.css";

export interface HallScreenProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

const KIND_LABEL: Readonly<Record<SwapTable["kind"], string>> = {
  stitch: "Snip a seam",
  stain: "Lift a stain",
  seam: "Sew a split",
};

function neighbourLook(name: string) {
  return SWAP_NEIGHBOURS.find((entry) => entry.name === name)?.look ?? MENTOR_LOOK;
}

function TableCard({
  state,
  table,
  onOpen,
}: {
  readonly state: GameState;
  readonly table: SwapTable;
  readonly onOpen: () => void;
}) {
  const done = tableDone(state, table);
  const well = done && isWellMended(state, table);
  const issue = tableIssue(state, table.id);
  return (
    <li
      className={done ? "tf-hall-table tf-hall-table--done" : "tf-hall-table"}
      data-testid={`table-${table.id}`}
    >
      <div className="tf-hall-table__who">
        <Avatar
          look={neighbourLook(table.neighbour)}
          size={56}
          frameColour="#e9e8fb"
          title={table.neighbour}
        />
        <strong>{table.neighbour}</strong>
      </div>
      <FindArt find={findById(table.findId)} grade={done ? "like-new" : "loved"} size={70} mended={done} />
      <p className="tf-hall-table__request">“{table.request}”</p>
      <span className="tf-hall-table__kind">{KIND_LABEL[table.kind]}</span>
      {done ? (
        <span className={well ? "tf-hall-table__badge tf-hall-table__badge--well" : "tf-hall-table__badge"}>
          {well ? "Well mended! +1 saved" : "Mended with love"}
        </span>
      ) : (
        <Button
          size="sm"
          onClick={onOpen}
          disabledReason={issue ?? undefined}
          data-testid={`help-${table.id}`}
        >
          {table.charged ? "Carry on" : `Help · ${TABLE_HOURS} h`}
        </Button>
      )}
    </li>
  );
}

export function HallScreen({ state, dispatch, onExit }: HallScreenProps) {
  const toast = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const [giving, setGiving] = useState<string | null>(null);
  const swapDay = todaysSwapDay(state);
  const season = seasonTheme(state);
  if (swapDay === null) return null;
  const table = swapDay.tables.find((entry) => entry.id === open);
  const palette = (season?.palette ?? ["sage", "blush", "ivory", "lavender"]).map((id) => colourById(id).hex);
  const well = wellMendedCount(state);
  const freeFinds = state.stock.finds.filter(
    (owned) => !(state.activeRun?.finds.some((entry) => entry.id === owned.id) ?? false),
  );
  const give = giving ?? freeFinds[0]?.id ?? null;

  const swap = (slotId: string) => {
    if (give === null) return;
    if (dispatch({ type: "swapFind", slotId, findKey: give })) {
      setGiving(null);
      toast("Swapped one for one. Things saved +1!");
    }
  };

  return (
    <main className="tf-hall-screen ad-screen" data-testid="hall-screen">
      <div className="tf-hall-screen__scene">
        <HallBackdrop
          banner="Swap & Mend"
          palette={palette}
          light="warm"
          crop="top"
          title="Larkspur Hall, set up for Swap & Mend"
        />
      </div>
      <header className="tf-hall-screen__head">
        <Button variant="secondary" icon="back" onClick={onExit}>
          Back to the shop
        </Button>
        <div>
          <span className="ad-eyebrow">Larkspur Hall · day {state.calendar.day}</span>
          <h1>Swap &amp; Mend</h1>
        </div>
        <div className="tf-hall-screen__stats">
          <StatChip kind="hours" value={`${state.calendar.hoursLeft} h`} />
          <span className="tf-hall-screen__saved">
            <Icon name="heart" size={16} /> {state.keptInUse} saved
          </span>
        </div>
      </header>
      <div className="tf-hall-screen__urn">
        <Avatar look={MENTOR_LOOK} size={64} frameColour="#e2f4ea" title="Femi" />
        <p>
          <strong>Femi:</strong> “The tea urn&apos;s on. No coins today, just fixing and swapping.”
        </p>
        <span className="tf-hall-screen__tally" data-testid="well-mended">
          {well} well mended
        </span>
      </div>
      {table !== undefined ? (
        <TableWork state={state} table={table} dispatch={dispatch} onClose={() => setOpen(null)} />
      ) : (
        <>
          <section className="tf-hall-section" aria-label="Mending tables">
            <h2>Mending tables</h2>
            <p className="tf-hint">
              <Icon name="needle" size={18} />
              {HINTS.tables}
            </p>
            <ul className="tf-hall-tables">
              {swapDay.tables.map((entry) => (
                <TableCard key={entry.id} state={state} table={entry} onOpen={() => setOpen(entry.id)} />
              ))}
            </ul>
          </section>
          <section className="tf-hall-section" aria-label="Swap rail" data-testid="swap-rail">
            <h2>
              Swap rail · {swapDay.swaps}/{swapLimit(state)} swaps
            </h2>
            <p className="tf-hint">
              <Icon name="hanger" size={18} />
              {HINTS.swap}
            </p>
            {freeFinds.length === 0 ? (
              <p className="ad-muted">Bring a find from your stockroom to swap. Rack pieces stay home.</p>
            ) : (
              <div className="tf-hall-give" role="radiogroup" aria-label="Your find to swap">
                {freeFinds.map((owned) => (
                  <button
                    key={owned.id}
                    type="button"
                    role="radio"
                    aria-checked={give === owned.id}
                    className={give === owned.id ? "tf-hall-give__find is-chosen" : "tf-hall-give__find"}
                    onClick={() => setGiving(owned.id)}
                  >
                    <FindArt find={findById(owned.findId)} grade={owned.grade} size={52} />
                    <span>{findById(owned.findId).name}</span>
                  </button>
                ))}
              </div>
            )}
            <ul className="tf-hall-rail">
              {swapDay.rail.map((slot) => {
                const find = findById(slot.findId);
                const issue =
                  give === null ? "Pick one of your finds first." : swapIssue(state, slot.id, give);
                return (
                  <li
                    key={slot.id}
                    className={slot.taken ? "tf-hall-rail__slot is-taken" : "tf-hall-rail__slot"}
                  >
                    <FindArt find={find} grade={slot.grade} size={76} />
                    <strong>{find.name}</strong>
                    <small>
                      {conditionById(slot.grade).name} · {find.backstory}
                    </small>
                    {slot.taken ? (
                      <span className="tf-hall-table__badge tf-hall-table__badge--well">Swapped!</span>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => swap(slot.id)}
                        disabledReason={issue ?? undefined}
                        data-testid={`swap-${slot.id}`}
                      >
                        Swap for it
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
