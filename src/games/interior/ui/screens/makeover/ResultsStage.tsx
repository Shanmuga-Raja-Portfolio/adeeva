import { useEffect } from "react";
import { focusHeading } from "../../../../../studio/focusHeading";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { StarRating } from "../../../../../ui/kit/StarRating";
import { useCountUp } from "../../../../../ui/kit/useCountUp";
import { clientById, kidSummary, lastResult, roomById, type LogEntry } from "../../../core";
import { Confetti } from "../../art/Confetti";
import { RoomCutaway } from "../../art/RoomCutaway";
import { FINISHED, roomLook } from "../../art/roomLook";
import { OpenHousePanel } from "./OpenHousePanel";
import type { StageProps } from "./stageProps";
import "./results.css";

function Totals({ entry, instant }: { readonly entry: LogEntry; readonly instant: boolean }) {
  const coins = useCountUp(entry.reward.coins, 900, 300, instant);
  return (
    <div className="is-results__totals" data-testid="reward-totals">
      <span>
        <Icon name="coin" size={20} /> +{coins} coins
      </span>
      <span>
        <Icon name="star" size={20} /> {entry.reward.reputation >= 0 ? "+" : ""}
        {entry.reward.reputation} rep
      </span>
      <span>
        <Icon name="megaphone" size={20} /> +{entry.reward.buzz} buzz
      </span>
    </div>
  );
}

export function ResultsStage({ state, run, onExit }: StageProps) {
  const { reducedMotion } = useSettings();
  const entry = lastResult(state, run.id);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    focusHeading();
  }, []);
  const client = clientById(run.brief.clientId);
  const name = client?.name ?? "Your neighbour";
  if (entry === null)
    return (
      <div className="is-results" data-testid="results">
        <h1>This room is finished</h1>
        <Button onClick={onExit}>Back to the loft</Button>
      </div>
    );
  const { evaluation, reward } = entry;
  const happy = reward.outcome === "pass";
  const mood = evaluation.stars >= 4 ? "delighted" : happy ? "happy" : "thinking";
  const exit = (
    <Button size="lg" onClick={onExit} data-testid="results-exit">
      Back to the loft
    </Button>
  );
  return (
    <div className="is-results" data-testid="results">
      <div className="is-results__scene">
        {happy ? <Confetti /> : null}
        <RoomCutaway
          look={roomLook(run, FINISHED)}
          title={`${name}'s finished ${roomById(run.brief.roomId).name}`}
          className="is-results__room"
        />
        {client !== undefined ? (
          <div className="is-results__client">
            <Avatar look={client.look} mood={mood} size={124} title={client.name} frameColour="#fcefc2" />
            <blockquote className="is-results__quote">
              “{happy ? client.lines.delighted : client.lines.nearMiss}”
            </blockquote>
          </div>
        ) : null}
      </div>
      <section className="is-results__card is-tape-card">
        <span className="ad-eyebrow">{happy ? "Revealed with a gasp" : "A kind note"}</span>
        <h1>{happy ? `${name} loves it!` : `${name} says thank you`}</h1>
        <div className="is-results__stars">
          <StarRating stars={evaluation.stars} size={28} />
          <strong>{evaluation.score} / 100</strong>
        </div>
        <ul className="is-results__summary">
          {kidSummary(run, evaluation).map((line) => (
            <li
              key={line.id}
              className={line.good ? "is-results__kid" : "is-results__kid is-results__kid--soft"}
              data-testid={`kid-line-${line.id}`}
            >
              <Icon name={line.good ? "sparkle" : "heart"} size={14} />
              <span>
                <strong>{line.label}:</strong> {line.verdict}
              </span>
            </li>
          ))}
        </ul>
        <ul className="is-results__criteria">
          {evaluation.criteria.map((criterion) => (
            <li
              key={criterion.id}
              className={
                criterion.passed
                  ? "is-results__criterion is-results__criterion--pass"
                  : "is-results__criterion"
              }
            >
              <span className="is-results__mark" aria-hidden="true">
                {criterion.passed ? <Icon name="check" size={12} /> : "·"}
              </span>
              <strong>{criterion.label}</strong>
              <span className="is-muted">{criterion.detail}</span>
            </li>
          ))}
        </ul>
        {evaluation.feedback.length > 0 ? (
          <div className="is-results__feedback">
            {evaluation.feedback.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : null}
        <ul className="is-results__lines">
          {reward.lines.map((line) => (
            <li key={line.label}>
              <span>{line.label}</span>
              <strong>
                {line.amount >= 0 ? "+" : ""}
                {line.amount}
              </strong>
            </li>
          ))}
        </ul>
        <Totals entry={entry} instant={reducedMotion} />
        {entry.openHouse === null ? exit : null}
      </section>
      {entry.openHouse !== null ? (
        <>
          <OpenHousePanel run={run} visit={entry.openHouse} />
          <div className="is-results__exit">{exit}</div>
        </>
      ) : null}
    </div>
  );
}
