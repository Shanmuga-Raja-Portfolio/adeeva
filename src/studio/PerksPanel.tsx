import type { AccessoryId } from "../engine/avatar";
import { Icon, type IconName } from "../ui/kit/IconSet";
import { PERKS, type HomeThemeId, type Perk } from "./perks";

const KIND_ICON: Record<Perk["kind"], IconName> = {
  "hair-colour": "palette",
  outfit: "hanger",
  accessory: "sparkle",
  "home-theme": "home",
};

const KIND_TEXT: Record<Perk["kind"], string> = {
  "hair-colour": "Hair colour",
  outfit: "Outfit",
  accessory: "Accessory",
  "home-theme": "Studio theme",
};

export interface PerksPanelProps {
  readonly unlocked: readonly string[];
  readonly accessory: AccessoryId | null;
  readonly theme: HomeThemeId;
  readonly onAccessory: (accessory: AccessoryId | null) => void;
  readonly onTheme: (theme: HomeThemeId) => void;
}

function PerkAction({ perk, accessory, theme, onAccessory, onTheme }: PerksPanelProps & { perk: Perk }) {
  if (perk.kind === "accessory") {
    const wearing = accessory === perk.accessory;
    return (
      <button
        type="button"
        className="st-perk__action"
        aria-pressed={wearing}
        onClick={() => onAccessory(wearing ? null : perk.accessory)}
      >
        {wearing ? "Wearing" : "Wear"}
      </button>
    );
  }
  if (perk.kind === "home-theme") {
    const using = theme === perk.theme;
    return (
      <button
        type="button"
        className="st-perk__action"
        aria-pressed={using}
        onClick={() => onTheme(using ? "morning" : perk.theme)}
      >
        {using ? "In use" : "Use"}
      </button>
    );
  }
  return <span className="st-perk__ready">Ready in every game</span>;
}

export function PerksPanel(props: PerksPanelProps) {
  return (
    <section className="st-perks" aria-labelledby="st-perks-title">
      <header className="st-section-head">
        <span className="st-eyebrow">Cosmetic only</span>
        <h2 id="st-perks-title">Studio perks</h2>
        <p className="st-muted">
          Reputation from every game unlocks new looks for your avatar and your studio. Perks never change how
          a game plays.
        </p>
      </header>
      <ul className="st-perks__list">
        {PERKS.map((perk) => {
          const owned = props.unlocked.includes(perk.id);
          return (
            <li
              key={perk.id}
              className={owned ? "st-perk st-perk--owned" : "st-perk"}
              data-testid={`perk-${perk.id}`}
            >
              <span className="st-perk__icon">
                <Icon name={owned ? KIND_ICON[perk.kind] : "lock"} size={20} />
              </span>
              <span className="st-perk__text">
                <strong>{perk.label}</strong>
                <span className="st-perk__meta">
                  {KIND_TEXT[perk.kind]} · {owned ? "Unlocked" : `Unlocks at ${perk.threshold} reputation`}
                </span>
              </span>
              {owned ? <PerkAction {...props} perk={perk} /> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
