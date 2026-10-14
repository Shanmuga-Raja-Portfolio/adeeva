import { useState } from "react";
import { colourById, type ColourId } from "../../../../../engine/palette";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { SegmentedControl } from "../../../../../ui/kit/SegmentedControl";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { MENU_ITEM_NAMES, MENU_TIERS, type MenuTierId } from "../../../content/menuTier";
import { COUNTER_PRODUCT_IDS, type CounterProductId } from "../../../content/product";
import {
  canRestParlour,
  canSetMenu,
  currentSeason,
  menuEntryIssue,
  menuPalette,
  mixOptions,
  productById,
  suggestedMenu,
  type GameState,
  type MenuEntry,
  type SalonMenu,
} from "../../../core";
import { TreatIcon } from "../../art/TreatIcon";

export interface MenuBoardProps {
  readonly state: GameState;
  readonly onConfirm: (event: ClickLike, menu: SalonMenu) => void;
  readonly onRest: (event: ClickLike) => void;
}

function counterIds(ids: readonly string[]): CounterProductId[] {
  return ids.flatMap((id) => {
    const found = COUNTER_PRODUCT_IDS.find((entry) => entry === id);
    return found === undefined ? [] : [found];
  });
}

function TierEditor({
  tier,
  entry,
  palette,
  seasonTags,
  onChange,
}: {
  readonly tier: (typeof MENU_TIERS)[number];
  readonly entry: MenuEntry;
  readonly palette: readonly ColourId[];
  readonly seasonTags: readonly string[];
  readonly onChange: (entry: MenuEntry) => void;
}) {
  const [slot, setSlot] = useState<0 | 1>(0);
  const product = productById(entry.productId);
  const products = counterIds(tier.products);
  const setColour = (colour: ColourId) => {
    const other = entry.colours[slot === 0 ? 1 : 0];
    if (colour === other) return;
    const colours: [ColourId, ColourId] =
      slot === 0 ? [colour, entry.colours[1]] : [entry.colours[0], colour];
    onChange({ ...entry, colours });
    setSlot(slot === 0 ? 1 : 0);
  };
  return (
    <article className="pa-menu-tier" data-tier={tier.id}>
      <header className="pa-menu-tier__head">
        <span className="pa-menu-tier__icons" aria-hidden="true">
          <TreatIcon productId={entry.productId} colour={colourById(entry.colours[0]).hex} size={46} />
          <TreatIcon productId={entry.productId} colour={colourById(entry.colours[1]).hex} size={46} />
        </span>
        <div>
          <span className="ad-eyebrow">{tier.name}</span>
          <h4>{MENU_ITEM_NAMES[entry.productId] ?? product.name}</h4>
        </div>
      </header>
      {products.length > 1 ? (
        <SegmentedControl
          label={`${tier.name} bake`}
          options={products.map((id) => ({ value: id, label: MENU_ITEM_NAMES[id] ?? productById(id).name }))}
          value={entry.productId}
          onChange={(productId) => {
            const mix = mixOptions(productById(productId))[0];
            if (mix !== undefined) onChange({ ...entry, productId, mixId: mix.id });
          }}
        />
      ) : null}
      <div className="pa-menu-tier__mixes" role="radiogroup" aria-label={`${tier.name} mix`}>
        {mixOptions(product).map((mix) => (
          <button
            key={mix.id}
            type="button"
            role="radio"
            aria-checked={entry.mixId === mix.id}
            className="pa-menu-mix"
            onClick={() => onChange({ ...entry, mixId: mix.id })}
          >
            <span className="pa-menu-mix__blob" style={{ background: mix.colour }} aria-hidden="true" />
            <span>{mix.name}</span>
            {mix.tags.some((tag) => seasonTags.includes(tag)) ? (
              <span className="pa-menu-mix__season" title="Carries a season tag">
                ★
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <div className="pa-menu-tier__colours">
        <div className="pa-menu-tier__slots" role="radiogroup" aria-label={`${tier.name} colour to change`}>
          {([0, 1] as const).map((index) => (
            <button
              key={index}
              type="button"
              role="radio"
              aria-checked={slot === index}
              className="pa-menu-slot"
              onClick={() => setSlot(index)}
            >
              <span style={{ background: colourById(entry.colours[index]).hex }} aria-hidden="true" />
              {colourById(entry.colours[index]).name}
            </button>
          ))}
        </div>
        <div className="pa-menu-tier__palette" role="group" aria-label={`${tier.name} colours`}>
          {palette.map((colour) => (
            <button
              key={colour}
              type="button"
              className="pa-swatch pa-swatch--small"
              aria-pressed={entry.colours.includes(colour)}
              aria-label={colourById(colour).name}
              title={colourById(colour).name}
              style={{ background: colourById(colour).hex }}
              onClick={() => setColour(colour)}
            >
              {entry.colours.includes(colour) ? <Icon name="check" size={16} /> : null}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

export function MenuBoard({ state, onConfirm, onRest }: MenuBoardProps) {
  const [draft, setDraft] = useState<SalonMenu | null>(() => suggestedMenu(state));
  const fair = state.fair;
  if (draft === null || fair === null) return null;
  const palette = menuPalette(state);
  const seasonTags = currentSeason(fair).menuTags;
  const issue =
    MENU_TIERS.map((tier) => menuEntryIssue(tier.id, draft[tier.id])).find((entry) => entry !== null) ?? null;
  const check = canSetMenu(state);
  const rest = canRestParlour(state);
  const update = (tier: MenuTierId, entry: MenuEntry) => setDraft({ ...draft, [tier]: entry });
  return (
    <div className="pa-season-step">
      <header className="pa-season-step__head">
        <span className="pa-season-step__number">2</span>
        <div>
          <h3>The Menu Board</h3>
          <p className="pa-muted">
            Marigold suggests a menu for the season. Change anything you like, then open the parlour.
          </p>
        </div>
        <span className="pa-season-step__tags">
          Season feel:{" "}
          {seasonTags.map((tag) => (
            <TagPill key={tag} tone="hot">
              {tag}
            </TagPill>
          ))}
        </span>
      </header>
      <div className="pa-menu">
        {MENU_TIERS.map((tier) => (
          <TierEditor
            key={tier.id}
            tier={tier}
            entry={draft[tier.id]}
            palette={palette}
            seasonTags={seasonTags}
            onChange={(entry) => update(tier.id, entry)}
          />
        ))}
      </div>
      <div className="pa-season-step__actions">
        <Button
          variant="ghost"
          onClick={onRest}
          disabledReason={rest.ok ? undefined : rest.reasons[0]}
          data-testid="rest-parlour"
        >
          Rest the parlour this season
        </Button>
        <Button
          icon="sparkle"
          size="lg"
          onClick={(event) => onConfirm(event, draft)}
          disabledReason={issue ?? (check.ok ? undefined : check.reasons[0])}
          showReason
          data-testid="confirm-menu"
        >
          Open the parlour with this menu
        </Button>
      </div>
      <p className="pa-hint">Resting keeps the bakery rent and skips this season's Salon Day and Fair.</p>
    </div>
  );
}
