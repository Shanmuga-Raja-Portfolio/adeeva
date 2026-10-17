import { LOOKS_PER_SEASON, seasonTheme, type GameState } from "../../../core";
import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { StarRating } from "../../../../../ui/kit/StarRating";
import { DressPreview } from "../../art/DressPreview";
import { lookDress } from "../label/lookDress";
import { TagPill } from "../../../../../ui/kit/TagPill";

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
      <ol className="ad-season__looks">
        {Array.from({ length: LOOKS_PER_SEASON }, (_, index) => {
          const look = season.looks[index] ?? null;
          const status = look !== null ? "done" : tableLook === index ? "table" : "open";
          const dress = look !== null ? lookDress(look) : null;
          return (
            <li key={index} className={`ad-look ad-look--${status}`}>
              <span className="ad-look__dress" aria-hidden="true">
                {dress !== null ? (
                  <DressPreview
                    parts={dress.parts}
                    fabrics={dress.fabrics}
                    trims={dress.trims}
                    figure="form"
                    title=""
                  />
                ) : (
                  <Icon name={status === "table" ? "needle" : "hanger"} size={26} />
                )}
              </span>
              <span className="ad-look__number">Look {index + 1}</span>
              {look !== null ? (
                <>
                  <span className="ad-look__status ad-look__status--done">
                    <Icon name="check" size={14} /> Ready
                  </span>
                  <StarRating stars={look.evaluation.stars} size={18} />
                </>
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
      <div className="ad-season__meta">
        <span>
          <Icon name="megaphone" size={16} /> {season.venue}
        </span>
        <span>
          <Icon name="calendar" size={16} />{" "}
          {season.result !== null
            ? "Show complete"
            : daysLeft > 0
              ? `Show on day ${season.deadlineDay} · ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`
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
    </Card>
  );
}
