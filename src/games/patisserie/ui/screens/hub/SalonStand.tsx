import { colourById, type ColourId } from "../../../../../engine/palette";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { MENU_ITEM_NAMES, MENU_TIERS, type MenuTierId } from "../../../content/menuTier";
import { salonDayOf, salonTrayIssue, type GameState, type SalonState } from "../../../core";
import { ServingTable } from "../../art/ServingTable";
import { ThreeTierStand } from "../../art/ThreeTierStand";
import { TreatIcon } from "../../art/TreatIcon";

export interface SalonStandProps {
  readonly state: GameState;
  readonly onBakeTray: (event: ClickLike, tier: MenuTierId) => void;
}

const GLINTS: readonly (readonly [number, number])[] = [
  [24, 14],
  [80, 40],
  [12, 70],
  [92, 76],
];

const PLATES: Readonly<
  Record<MenuTierId, { readonly y: number; readonly rx: number; readonly seats: number }>
> = {
  top: { y: 92, rx: 70, seats: 3 },
  middle: { y: 196, rx: 104, seats: 4 },
  bottom: { y: 300, rx: 138, seats: 5 },
};

function plated(
  colours: readonly [ColourId, ColourId],
  tray: SalonState["shelf"][number] | undefined,
  seats: number,
): ColourId[] {
  const left = tray === undefined ? [seats, seats] : tray.left;
  const out: ColourId[] = [];
  for (let index = 0; out.length < seats && index < seats; index += 1)
    colours.forEach((colour, slot) => {
      if (out.length < seats && index < (left[slot] ?? 0)) out.push(colour);
    });
  return out;
}

export function SalonStand({ state, onBakeTray }: SalonStandProps) {
  const { salon, fair } = state;
  const menu = salon?.menu ?? null;
  const done = salon !== null && fair !== null && salon.doneDay >= salonDayOf(fair);
  return (
    <div className="pa-salon-stand" data-testid="salon-stand">
      <ServingTable className="pa-salon-stand__table" />
      <div className="pa-salon-stand__tiers">
        <span className="pa-salon-stand__glow" aria-hidden="true" />
        <ThreeTierStand className="pa-salon-stand__art" silver={state.upgrades.includes("silver-stands")} />
        {GLINTS.map(([left, top], index) => (
          <span
            key={`${left}-${top}`}
            className="pa-salon-stand__glint"
            style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${index * -0.7}s` }}
            aria-hidden="true"
          />
        ))}
        {menu === null || salon === null
          ? null
          : MENU_TIERS.map((tier) => {
              const entry = menu[tier.id];
              const plate = PLATES[tier.id];
              const tray = salon.shelf.find((item) => item.tier === tier.id);
              const treats = plated(entry.colours, tray, plate.seats);
              const name = MENU_ITEM_NAMES[entry.productId] ?? tier.name;
              const issue = salonTrayIssue(state, tier.id);
              const stock = tray === undefined ? 0 : tray.left[0] + tray.left[1];
              return (
                <div key={tier.id} className="pa-salon-stand__tier">
                  <span
                    className={
                      tray === undefined
                        ? "pa-salon-stand__plate pa-salon-stand__plate--ghost"
                        : "pa-salon-stand__plate"
                    }
                    style={{
                      bottom: `${((360 - plate.y - 3) / 360) * 100}%`,
                      left: `${((160 - plate.rx * 0.82) / 320) * 100}%`,
                      width: `${((plate.rx * 1.64) / 320) * 100}%`,
                    }}
                    aria-hidden="true"
                  >
                    {treats.map((colour, index) => (
                      <span key={index} className="pa-salon-stand__treat">
                        <TreatIcon productId={entry.productId} colour={colourById(colour).hex} size={48} />
                      </span>
                    ))}
                  </span>
                  <span
                    className={tray === undefined ? "pa-salon-tag pa-salon-tag--empty" : "pa-salon-tag"}
                    style={{
                      top: `${((plate.y + 2) / 360) * 100}%`,
                      left: `${((160 + plate.rx - 6) / 320) * 100}%`,
                    }}
                  >
                    <span className="pa-salon-tag__name">{name}</span>
                    {tray !== undefined ? (
                      <span className="pa-salon-tag__stock">
                        {stock} left
                        <span className="ad-visually-hidden"> on the stand</span>
                      </span>
                    ) : done ? (
                      <span className="pa-salon-tag__later">Next season</span>
                    ) : (
                      <button
                        type="button"
                        className="pa-salon-tag__bake"
                        onClick={(event) => onBakeTray(event, tier.id)}
                        disabled={issue !== null}
                        title={issue ?? undefined}
                        aria-label={`Bake the ${tier.name.toLowerCase()} tray of ${name.toLowerCase()}, 6 hours`}
                      >
                        <Icon name="sparkle" size={14} /> Bake · 6 h
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
      </div>
    </div>
  );
}
