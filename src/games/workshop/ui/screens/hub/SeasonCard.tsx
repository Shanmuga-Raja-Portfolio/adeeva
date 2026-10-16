import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { FairThemeDef, FairThemeId } from "../../../content/fairTheme";
import {
  canChooseTheme,
  canRestShowroom,
  currentSeason,
  fairEligibleSets,
  fairDayOf,
  fairThemeById,
  isFairDay,
  isLateFairDay,
  seasonBegun,
  seasonByNumber,
  seasonThemes,
  shadeById,
  type GameState,
} from "../../../core";

export interface SeasonCardProps {
  readonly state: GameState;
  readonly onTheme: (event: ClickLike, themeId: FairThemeId) => void;
  readonly onRest: (event: ClickLike) => void;
  readonly onFair: () => void;
}

export function ThemeSwatches({ theme }: { readonly theme: FairThemeDef }) {
  return (
    <span
      className="ww-theme__palette"
      aria-label={`Palette: ${theme.palette.map((id) => shadeById(id).name).join(", ")}`}
    >
      {theme.palette.map((id) => (
        <span
          key={id}
          className="ww-theme__swatch"
          style={{ background: shadeById(id).hex }}
          title={shadeById(id).name}
        />
      ))}
    </span>
  );
}

function ThemeOption({
  theme,
  onPick,
  issue,
}: {
  theme: FairThemeDef;
  onPick: (event: ClickLike) => void;
  issue: string | undefined;
}) {
  return (
    <article className="ww-theme" data-testid={`theme-${theme.id}`}>
      <strong className="ww-theme__name">{theme.name}</strong>
      <span className="ww-theme__tags">
        {theme.tags.map((tag) => (
          <TagPill key={tag} tone="sage">
            {tag}
          </TagPill>
        ))}
      </span>
      <ThemeSwatches theme={theme} />
      <span className="ww-muted">Feels {theme.moods.join(" and ")}</span>
      <Button size="sm" onClick={onPick} disabledReason={issue} aria-label={`Choose ${theme.name}`}>
        Choose
      </Button>
    </article>
  );
}

export function SeasonCard({ state, onTheme, onRest, onFair }: SeasonCardProps) {
  const { showroom, fair } = state;
  if (state.career !== "showroom" || showroom === null || fair === null) return null;
  const season = currentSeason(showroom);
  const begun = seasonBegun(showroom, state.calendar.day);
  const theme = showroom.themeId === null ? null : fairThemeById(showroom.themeId);
  const fairOpen = isFairDay(state) || isLateFairDay(state);
  const rest = canRestShowroom(state);
  const nextPair = seasonThemes(showroom.seasonNumber + 1);
  return (
    <Card
      tone="gold"
      eyebrow={`${season.name} · Larkspur Craft Fair`}
      title={
        showroom.rested ? "Resting this season" : theme === null ? "Pick this season's theme" : theme.name
      }
      className="ww-hub-card ww-season"
      data-testid="season-card"
    >
      {!begun ? (
        <p className="ww-muted">
          Season {showroom.seasonNumber} starts on day {showroom.seasonStartDay}. Sets you make now are ready
          for it.
        </p>
      ) : null}
      {begun && !showroom.rested && theme === null ? (
        <>
          <div className="ww-season__themes">
            {seasonThemes(showroom.seasonNumber).map((option) => (
              <ThemeOption
                key={option.id}
                theme={option}
                onPick={(event) => onTheme(event, option.id)}
                issue={canChooseTheme(state, option.id).reasons[0]}
              />
            ))}
          </div>
          {rest.ok ? (
            <Button variant="ghost" size="sm" onClick={onRest} data-testid="rest-shop">
              Rest the shop this season
            </Button>
          ) : null}
        </>
      ) : null}
      {theme !== null ? (
        <div className="ww-season__chosen">
          <span className="ww-theme__tags">
            {theme.tags.map((tag) => (
              <TagPill key={tag} tone="sage">
                {tag}
              </TagPill>
            ))}
          </span>
          <ThemeSwatches theme={theme} />
          <span className="ww-muted">Feels {theme.moods.join(" and ")}</span>
        </div>
      ) : null}
      {showroom.rested ? (
        <p className="ww-muted">Rent is just the garage this season, and Ren's wage is paused.</p>
      ) : null}
      {!showroom.rested ? (
        <p className="ww-hint">
          <Icon name="calendar" size={14} /> Fair Day is day {fairDayOf(showroom)}. Open House on season days
          7 and 14.
        </p>
      ) : null}
      {fair.result !== null ? (
        <Button icon="star" onClick={onFair} data-testid="fair-results">
          See the Fair results
        </Button>
      ) : fairOpen && theme !== null ? (
        <Button
          size="lg"
          icon="sparkle"
          onClick={onFair}
          disabledReason={
            fairEligibleSets(state).length === 0 ? "Finish a new set that fits the booth first." : undefined
          }
          showReason
          data-testid="go-to-fair"
        >
          To the Fair Board
        </Button>
      ) : null}
      {state.profile.trait === "trendsetter" && nextPair.length > 0 ? (
        <p className="ww-hint">
          <Icon name="megaphone" size={14} /> Next season ({seasonByNumber(showroom.seasonNumber + 1).name}):{" "}
          {nextPair.map((entry) => entry.name).join(" or ")}
        </p>
      ) : null}
    </Card>
  );
}
