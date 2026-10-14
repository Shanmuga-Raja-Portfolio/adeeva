import { colourById } from "../../../../../engine/palette";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useRovingRadio } from "../../../../../ui/kit/useRovingRadio";
import { MENU_ITEM_NAMES } from "../../../content/menuTier";
import {
  menuTierById,
  mixById,
  splitCovers,
  splitTally,
  TRAY_SPLITS,
  type BakeRun,
  type GameState,
  type Action,
} from "../../../core";
import { TreatIcon } from "../../art/TreatIcon";

export interface SplitPickerProps {
  readonly state: GameState;
  readonly run: BakeRun;
  readonly dispatch: (action: Action) => boolean;
}

const SPLIT_KEYS = TRAY_SPLITS.map(String);

export function SplitPicker({ state, run, dispatch }: SplitPickerProps) {
  const salon = state.salon;
  const menu = salon?.menu ?? null;
  const tier = run.purpose.kind === "salon-tray" ? run.purpose.tier : null;
  const roving = useRovingRadio(
    SPLIT_KEYS.map((value) => ({ value })),
    String(run.design.split),
    (value) => dispatch({ type: "chooseSplit", split: Number(value) }),
  );
  if (salon === null || menu === null || tier === null) return null;
  const entry = menu[tier];
  const [first, second] = entry.colours;
  const tally = splitTally(salon.bookings, menu, tier);
  return (
    <section className="pa-design__section" aria-labelledby="pa-design-split">
      <h2 id="pa-design-split">
        {menuTierById(tier).name}: {MENU_ITEM_NAMES[entry.productId]} in {mixById(entry.mixId).name}
      </h2>
      <p className="pa-split__tally" data-testid="split-tally">
        <Icon name="heart" size={16} /> Bookings: {colourById(first).name} {tally[0]} booked ·{" "}
        {colourById(second).name} {tally[1]} booked
      </p>
      {state.profile.difficulty === "relaxed" ? (
        <p className="pa-hint">Otti counted the bookings and picked the split for you.</p>
      ) : null}
      <div className="pa-split" role="radiogroup" aria-label="Colour split for six treats">
        {TRAY_SPLITS.map((split, index) => {
          const covers = splitCovers(split, tally);
          return (
            <button
              key={split}
              ref={roving.buttonRef(index)}
              type="button"
              role="radio"
              aria-checked={run.design.split === split}
              tabIndex={roving.tabIndex(index)}
              className={
                covers ? "pa-choice pa-split__option pa-split__option--covers" : "pa-choice pa-split__option"
              }
              onClick={() => dispatch({ type: "chooseSplit", split })}
              onKeyDown={(event) => roving.handleKey(event, index)}
              aria-label={`${split} ${colourById(first).name} and ${6 - split} ${colourById(second).name}${covers ? ", covers every booking" : ""}`}
              data-testid={`split-${split}`}
            >
              <span className="pa-split__treats" aria-hidden="true">
                {Array.from({ length: 6 }, (_, at) => (
                  <TreatIcon
                    key={at}
                    productId={entry.productId}
                    colour={colourById(at < split ? first : second).hex}
                    size={28}
                  />
                ))}
              </span>
              <strong>
                {split} / {6 - split}
              </strong>
              {covers ? <span className="pa-choice__love">Covers the bookings</span> : null}
            </button>
          );
        })}
      </div>
      <p className="pa-hint">A two-colour tray uses one more pot of gel. Ivory is free.</p>
    </section>
  );
}
