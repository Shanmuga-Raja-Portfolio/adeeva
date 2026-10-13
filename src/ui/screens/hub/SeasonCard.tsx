import { LOOKS_PER_SEASON, seasonTheme, type GameState } from "../../../core";
import { Button } from "../../kit/Button";
import { Card } from "../../kit/Card";
import { Icon } from "../../kit/IconSet";
import { StarRating } from "../../kit/StarRating";
import { TagPill } from "../../kit/TagPill";

export interface SeasonCardProps {
  state: GameState;
  onOpenBoard: () => void;
}

export function SeasonCard({ state, onOpenBoard }: SeasonCardProps) {
  const season = state.season;
  if (season === null) return null;
  const theme = seasonTheme(season);
  const daysLeft = season.deadlineDay - state.calendar.day;
  const run = state.activeRun;
  const tableLook =
    run !== null && run.stage !== "done" && run.purpose.kind === "look" ? run.purpose.lookIndex : null;
  return (
    <Card
      tone="gold"
      eyebrow={`Season ${season.number}`}
      title={theme.name}
      className="ad-hub-card ad-season"
      data-testid="season-card"
    >
      <p className="ad-season__pitch">{theme.pitch}</p>
      <div className="ad-season__meta">
        <span>
          <Icon name="megaphone" size={16} /> {season.venue}
        </span>
        <span>
          <Icon name="calendar" size={16} />{" "}
          {season.result !== null
            ? "Show complete"
            : daysLeft > 0
              ? `Show on day ${season.deadlineDay} · ${daysLeft} days left`
              : daysLeft === 0
                ? "Show day is today"
                : `Show was due on day ${season.deadlineDay}`}
        </span>
      </div>
      <div className="ad-season__tags">
        {theme.requiredTags.map((tag) => (
          <TagPill key={tag} tone="gold">
            {tag}
          </TagPill>
        ))}
      </div>
      <ol className="ad-season__looks">
        {Array.from({ length: LOOKS_PER_SEASON }, (_, index) => {
          const look = season.looks[index] ?? null;
          const status = look !== null ? "done" : tableLook === index ? "table" : "open";
          return (
            <li key={index} className={`ad-look ad-look--${status}`}>
              <span className="ad-look__number">Look {index + 1}</span>
              {look !== null ? (
                <StarRating stars={look.evaluation.stars} size={12} />
              ) : (
                <span className="ad-look__status">{status === "table" ? "On the table" : "Not started"}</span>
              )}
            </li>
          );
        })}
      </ol>
      <Button block icon="palette" onClick={onOpenBoard}>
        Open collection board
      </Button>
    </Card>
  );
}
