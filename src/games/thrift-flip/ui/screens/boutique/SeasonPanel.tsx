import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { colourById } from "../../../../../engine/palette";
import {
  SEASON_LENGTH_DAYS,
  SHOWCASE_FIRST_DAY,
  SHOWCASE_LAST_DAY,
  SWAP_SEASON_DAY,
} from "../../../content/season";
import { hallTip, isShowcaseDay, seasonDay, seasonTheme, type GameState } from "../../../core";
import { RUNWAY_LIGHTS } from "../../../../adeeva/content/runwayLight";
import { MUSIC_MOODS } from "../../../../../engine/musicMood";

export interface SeasonPanelProps {
  readonly state: GameState;
  readonly onOpenShowcase: () => void;
}

function dayKind(day: number): string {
  if (day % 7 === 0) return "till";
  if (day === SWAP_SEASON_DAY) return "swap";
  if (day >= SHOWCASE_FIRST_DAY && day <= SHOWCASE_LAST_DAY) return "show";
  return "work";
}

export function SeasonPanel({ state, onOpenShowcase }: SeasonPanelProps) {
  const season = seasonTheme(state);
  const boutique = state.boutique;
  const today = seasonDay(state);
  if (season === null || boutique === null || today === null) return null;
  const tip = hallTip(state);
  const staged = boutique.season.showcase;
  return (
    <Card
      title={season.name}
      eyebrow={`Season ${boutique.season.number} theme`}
      className="tf-hub-card tf-season"
      data-testid="season-panel"
    >
      <div className="tf-season__tags">
        {season.tags.map((tag) => (
          <TagPill key={tag} tone="hot">
            {tag}
          </TagPill>
        ))}
      </div>
      <div className="tf-season__palette" aria-label="Season colours">
        {season.palette.map((colour) => (
          <span
            key={colour}
            className="tf-season__swatch"
            style={{ background: colourById(colour).hex }}
            title={colourById(colour).name}
          />
        ))}
      </div>
      <ol className="tf-season__days" aria-label={`Season day ${today} of ${SEASON_LENGTH_DAYS}`}>
        {Array.from({ length: SEASON_LENGTH_DAYS }, (_, index) => {
          const day = index + 1;
          return (
            <li
              key={day}
              className={`tf-season__day tf-season__day--${dayKind(day)}${day === today ? " is-today" : ""}${day < today ? " is-past" : ""}`}
              title={`Day ${day}`}
            >
              {day}
            </li>
          );
        })}
      </ol>
      <ul className="tf-season__legend">
        <li>
          <span className="tf-key tf-key--till" /> Till Day
        </li>
        <li>
          <span className="tf-key tf-key--swap" /> Swap &amp; Mend
        </li>
        <li>
          <span className="tf-key tf-key--show" /> Showcase
        </li>
      </ul>
      {staged === null ? (
        <p className="ad-muted">
          The Showcase banner reads <strong>&ldquo;{season.banner}&rdquo;</strong>. Up to three pieces from
          this season.
        </p>
      ) : (
        <p className="ad-muted">
          Showcase done: <strong>{staged.result.overall}</strong> overall. The pieces sell as Showcase pieces
          this season.
        </p>
      )}
      {tip === null ? null : (
        <p className="tf-season__tip">
          Hall tip: {MUSIC_MOODS.find((mood) => mood.id === tip.mood)?.name} with{" "}
          {RUNWAY_LIGHTS.find((light) => light.id === tip.light)?.name}.
        </p>
      )}
      {staged === null && isShowcaseDay(state) ? (
        <Button icon="sparkle" onClick={onOpenShowcase} data-testid="season-showcase">
          Plan the Showcase
        </Button>
      ) : null}
    </Card>
  );
}
