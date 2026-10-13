import type { ShowThemeDef } from "../../../content/showTheme";
import { seasonMinQuality, type GameState, type LabelSeason } from "../../../core";
import { Icon } from "../../kit/IconSet";
import { TagPill } from "../../kit/TagPill";
import { DeadlineBadge } from "./DeadlineBadge";
import { PaletteChips } from "./PaletteChips";

export interface SeasonHeaderProps {
  state: GameState;
  season: LabelSeason;
  theme: ShowThemeDef;
}

export function SeasonHeader({ state, season, theme }: SeasonHeaderProps) {
  return (
    <header className="ad-season-head" data-testid="season-header">
      <div className="ad-season-head__glow" aria-hidden="true" />
      <div className="ad-season-head__copy">
        <span className="ad-season-head__eyebrow">
          Season {season.number} · {season.venue}
        </span>
        <h1 className="ad-season-head__title">{theme.name}</h1>
        <p className="ad-season-head__pitch">{theme.pitch}</p>
        <div className="ad-season-head__tags">
          <span className="ad-season-head__label">The brief</span>
          {theme.requiredTags.map((tag) => (
            <TagPill key={tag} tone="gold">
              {tag}
            </TagPill>
          ))}
        </div>
      </div>
      <div className="ad-season-head__side">
        <DeadlineBadge
          day={state.calendar.day}
          startDay={season.startDay}
          deadlineDay={season.deadlineDay}
          complete={season.result !== null}
        />
        <dl className="ad-season-head__facts">
          <div>
            <dt>
              <Icon name="coin" size={16} /> Budget per look
            </dt>
            <dd>{theme.budget} coins</dd>
          </div>
          <div>
            <dt>
              <Icon name="star" size={16} /> Minimum quality
            </dt>
            <dd>{seasonMinQuality(state, season)}</dd>
          </div>
        </dl>
      </div>
      <div className="ad-season-head__palette">
        <span className="ad-season-head__label">Season palette</span>
        <PaletteChips colours={theme.palette} showNames label={`${theme.name} palette`} />
      </div>
    </header>
  );
}
