import { Icon } from "../../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../../ui/kit/TagPill";
import { HINTS } from "../../../../content/hint";
import { PART_OPTIONS, SLOT_NAMES, type PartSlot } from "../../../../content/partOption";
import { hammersFor, WOODS } from "../../../../content/wood";
import {
  boardPrice,
  woodLockReason,
  type Action,
  type CommissionRun,
  type GameState,
} from "../../../../core";
import { HammerIcons } from "../../../art/HammerIcons";
import { woodLook } from "../../../art/woodLook";

export interface DesignChoicesProps {
  readonly state: GameState;
  readonly run: CommissionRun;
  readonly slots: readonly PartSlot[];
  readonly dispatch: (action: Action) => boolean;
}

export function SlotChoices({ run, slots, dispatch }: Omit<DesignChoicesProps, "state">) {
  return (
    <>
      {slots.map((slot) => (
        <section key={slot} aria-labelledby={`ww-design-${slot}`}>
          <h2 id={`ww-design-${slot}`} className="ww-design__heading">
            {SLOT_NAMES[slot]}
          </h2>
          <div className="ww-design__chips" role="radiogroup" aria-label={SLOT_NAMES[slot]}>
            {PART_OPTIONS.filter((option) => option.slot === slot).map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={run.design.options[slot] === option.id}
                className="ww-design__chip"
                onClick={() => dispatch({ type: "chooseOption", slot, optionId: option.id })}
              >
                <strong>{option.name}</strong>
                <span className="ww-design__chip-note">{option.sawNote}</span>
                <span className="ww-design__tags">
                  {option.tags.map((tag) => (
                    <TagPill key={tag} tone={run.brief.requiredTags.includes(tag) ? "sage" : "plain"}>
                      {tag}
                    </TagPill>
                  ))}
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

export function WoodChoices({ state, run, dispatch }: Omit<DesignChoicesProps, "slots">) {
  const woodId = run.design.woodId;
  const avoided = woodId !== null && run.brief.avoidWoods.includes(woodId);
  return (
    <section aria-labelledby="ww-design-wood">
      <h2 id="ww-design-wood" className="ww-design__heading">
        Wood
      </h2>
      <div className="ww-design__woods" role="radiogroup" aria-label="Wood">
        {WOODS.map((wood) => {
          const lock = woodLockReason(state, wood.id);
          const colours = woodLook(wood.id);
          return (
            <button
              key={wood.id}
              type="button"
              role="radio"
              aria-checked={woodId === wood.id}
              aria-label={`${wood.name}${lock === null ? "" : `, locked. ${lock}`}`}
              className="ww-design__wood"
              disabled={lock !== null}
              title={lock ?? undefined}
              onClick={() => dispatch({ type: "chooseWood", woodId: wood.id })}
              data-testid={`wood-${wood.id}`}
            >
              <span
                className="ww-design__wood-swatch"
                style={{
                  background: `repeating-linear-gradient(176deg, ${colours.base} 0 7px, ${colours.line} 7px 8px, ${colours.base} 8px 13px, ${colours.light} 13px 15px)`,
                }}
                aria-hidden="true"
              >
                {lock !== null ? <Icon name="lock" size={18} /> : null}
              </span>
              <strong>{wood.name}</strong>
              <span className="ww-design__wood-meta">
                <span className="ww-coin-line">
                  <Icon name="coin" size={14} /> {boardPrice(state, wood.id, "long")}
                </span>
                <HammerIcons count={hammersFor(wood)} />
              </span>
              <span className="ww-design__wood-tags">{wood.tags.join(" · ")}</span>
            </button>
          );
        })}
      </div>
      {avoided ? (
        <p className="ww-design__warn" role="status">
          <Icon name="lock" size={16} /> {HINTS.avoidedWood}
        </p>
      ) : null}
    </section>
  );
}
