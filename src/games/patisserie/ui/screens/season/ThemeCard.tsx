import { colourById } from "../../../../../engine/palette";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { FairThemeDef } from "../../../content/fairTheme";
import { toppingById } from "../../../core";
import { ThemeVignette } from "../../art/ThemeVignette";
import { ToppingBadge } from "../../art/ToppingArt";

export interface ThemeCardProps {
  readonly theme: FairThemeDef;
  readonly compact?: boolean | undefined;
  readonly titled?: boolean | undefined;
}

export function ThemeCard({ theme, compact = false, titled = true }: ThemeCardProps) {
  return (
    <span className={compact ? "pa-theme pa-theme--compact" : "pa-theme"} data-theme={theme.id}>
      <ThemeVignette theme={theme} className="pa-theme__vignette" />
      <span className="pa-theme__sky" aria-hidden="true">
        {theme.palette.map((colour) => (
          <span key={colour} style={{ background: colourById(colour).hex }} />
        ))}
      </span>
      <span className="pa-theme__body">
        {titled ? <strong className="pa-theme__name">{theme.name}</strong> : null}
        {compact ? null : <span className="pa-theme__blurb">{theme.blurb}</span>}
        <span className="pa-theme__tags">
          {theme.tags.map((tag) => (
            <TagPill key={tag} tone="gold">
              {tag}
            </TagPill>
          ))}
        </span>
        <span className="pa-theme__topping">
          <ToppingBadge toppingId={theme.topping} size={30} />
          <span>{toppingById(theme.topping).name}</span>
        </span>
        <span className="pa-theme__moods">Feels {theme.moods.join(" and ")}</span>
      </span>
    </span>
  );
}
