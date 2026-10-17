import { jewelColourById } from "../../../content/jewelColour";
import type { LaunchThemeDef } from "../../../content/launchTheme";
import { themeWords } from "./themeWords";

export interface ThemeBadgeProps {
  readonly theme: LaunchThemeDef;
  readonly compact?: boolean | undefined;
}

export function ThemeBadge({ theme, compact = false }: ThemeBadgeProps) {
  return (
    <span className={compact ? "jb-theme-badge jb-theme-badge--compact" : "jb-theme-badge"}>
      <span
        className="jb-theme-badge__palette"
        aria-label={`Palette: ${theme.palette.map((id) => jewelColourById(id).name).join(", ")}`}
      >
        {theme.palette.map((id) => (
          <span key={id} className="jb-theme-badge__swatch" style={{ background: jewelColourById(id).hex }} />
        ))}
      </span>
      <span className="jb-theme-badge__tags">
        {theme.tags.map((tag) => (
          <span key={tag} className="jb-theme-badge__tag">
            {tag}
          </span>
        ))}
      </span>
      {compact ? null : (
        <span className="jb-theme-badge__words">
          {themeWords(theme).map((word) => (
            <em key={word}>{word}</em>
          ))}
        </span>
      )}
    </span>
  );
}
