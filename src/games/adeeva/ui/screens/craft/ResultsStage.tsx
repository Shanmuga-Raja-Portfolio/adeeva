import { dressGarment } from "../../art/avatarDress";
import type { CSSProperties } from "react";
import { latestEntryFor } from "../../../../../engine/runLog";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { DressPreview } from "../../art/DressPreview";
import { FittingStage } from "../../art/FittingStage";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { Meter } from "../../../../../ui/kit/Meter";
import { StarRating } from "../../../../../ui/kit/StarRating";
import { briefOwner } from "./briefOwner";
import { designFabrics, designParts } from "../../art/designLook";
import type { StageProps } from "./stageProps";
import { useCountUp } from "../../../../../ui/kit/useCountUp";
import "./results.css";

function delay(index: number): CSSProperties {
  return { "--reveal": index } as CSSProperties;
}

function signed(amount: number): string {
  return amount > 0 ? `+${amount}` : String(amount);
}

export function ResultsStage({ state, run, onExit }: StageProps) {
  const { reducedMotion } = useSettings();
  const entry = latestEntryFor(state.log, run.id);
  const score = useCountUp(entry?.evaluation.score ?? 0, 1400, 500, reducedMotion);
  const { client, theme } = briefOwner(run.brief);
  const dress = {
    parts: designParts(run.design),
    fabrics: designFabrics(run.design),
    trims: run.decorations,
  };
  if (entry === null) {
    return (
      <div className="ad-craft-results ad-craft-results--missing">
        <h1>The dress is delivered</h1>
        <p className="ad-muted">The result could not be found in your journal.</p>
        <Button onClick={onExit}>Back to studio</Button>
      </div>
    );
  }
  const { evaluation, reward } = entry;
  const happy = reward === null ? evaluation.passed : reward.outcome === "pass";
  const headline =
    run.purpose.kind === "look"
      ? "Look added to the collection"
      : happy
        ? `${client?.name ?? "Your client"} loves it!`
        : reward?.outcome === "soft-fail"
          ? "A near miss"
          : "Not quite this time";
  const quote =
    client !== undefined ? (happy ? client.lines.delighted : client.lines.nearMiss) : theme?.pitch;
  const quality = evaluation.quality;
  return (
    <div
      className={reducedMotion ? "ad-craft-results ad-craft-results--still" : "ad-craft-results"}
      data-testid="results"
    >
      <section className="ad-craft-results__hero">
        <div className="ad-craft-results__figure">
          <FittingStage className="ad-craft-results__stage" />
          {client !== undefined ? (
            <Avatar
              look={client.look}
              mood={happy ? "delighted" : "thinking"}
              pose={happy ? "wave" : "graceful"}
              garment={dressGarment(dress)}
              variant="full"
              title={`${client.name} wearing the dress`}
              className="ad-craft-results__avatar"
            />
          ) : (
            <DressPreview {...dress} title="The finished look" className="ad-craft-results__avatar" />
          )}
        </div>
        <div className="ad-craft-results__verdict">
          <span className="ad-eyebrow">{run.brief.occasion}</span>
          <h1>{headline}</h1>
          {quote !== undefined ? (
            <blockquote className="ad-craft-results__quote">“{quote}”</blockquote>
          ) : null}
          <div className="ad-craft-results__score">
            <span
              className="ad-craft-results__score-number"
              aria-label={`Score ${evaluation.score} out of 100`}
            >
              {score}
            </span>
            <span className="ad-craft-results__score-max">/ 100</span>
            <span className="ad-craft-results__stars">
              <StarRating stars={evaluation.stars} size={30} />
            </span>
          </div>
          {reward !== null ? (
            <div className="ad-craft-results__rewards" style={delay(2)}>
              <ul className="ad-craft-results__lines">
                {reward.lines.map((line) => (
                  <li key={line.label}>
                    <span>{line.label}</span>
                    <strong>{signed(line.amount)} coins</strong>
                  </li>
                ))}
              </ul>
              <div className="ad-craft-results__totals">
                <span className="ad-craft-results__total ad-craft-results__total--coins">
                  <Icon name="coin" size={24} /> {signed(reward.coins)}
                </span>
                <span className="ad-craft-results__total ad-craft-results__total--rep">
                  <Icon name="star" size={24} /> {signed(reward.reputation)} rep
                </span>
                <span className="ad-craft-results__total ad-craft-results__total--buzz">
                  <Icon name="megaphone" size={24} /> {signed(reward.buzz)} buzz
                </span>
              </div>
              {reward.trendMatches.length > 0 ? (
                <p className="ad-craft-results__trend">
                  <Icon name="sparkle" size={16} /> On trend: {reward.trendMatches.join(", ")}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="ad-craft-results__look-note" style={delay(2)}>
              <Icon name="hanger" size={18} /> Look{" "}
              {(run.purpose.kind === "look" ? run.purpose.lookIndex : 0) + 1} is hanging on the collection
              rail, ready for the runway.
            </p>
          )}
          <Button size="lg" onClick={onExit} data-testid="results-exit">
            Back to studio
          </Button>
        </div>
      </section>

      <section className="ad-craft-results__details">
        <div className="ad-craft-results__panel">
          <h2>How it measured up</h2>
          <ul className="ad-craft-results__criteria">
            {evaluation.criteria.map((criterion, index) => (
              <li
                key={criterion.id}
                className={
                  criterion.passed
                    ? "ad-craft-criterion ad-craft-criterion--passed"
                    : "ad-craft-criterion ad-craft-criterion--failed"
                }
                style={delay(index + 3)}
              >
                <span className="ad-craft-criterion__mark" aria-hidden="true">
                  {criterion.passed ? <Icon name="check" size={16} /> : "✕"}
                </span>
                <span className="ad-craft-criterion__text">
                  <strong>{criterion.label}</strong>
                  <span>{criterion.detail}</span>
                </span>
                <span className="ad-visually-hidden">{criterion.passed ? "passed" : "missed"}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="ad-craft-results__panel">
          <h2>Craft quality · {quality.quality}</h2>
          <div className="ad-craft-results__meters">
            <Meter
              label="Cutting"
              value={Math.round(quality.cut * 100)}
              tone="rose"
              valueText={`${Math.round(quality.cut * 100)}%`}
            />
            <Meter
              label="Seams"
              value={Math.round(quality.seams * 100)}
              tone="sage"
              valueText={`${Math.round(quality.seams * 100)}%`}
            />
            <Meter
              label="Grain"
              value={Math.round(quality.grain * 100)}
              tone="gold"
              valueText={`${Math.round(quality.grain * 100)}%`}
            />
            <Meter
              label="Fabric fit"
              value={Math.round(quality.materialFit * 100)}
              tone="ink"
              valueText={`${Math.round(quality.materialFit * 100)}%`}
            />
          </div>
          {evaluation.feedback.length > 0 ? (
            <div className="ad-craft-results__feedback">
              <h3>Notes for next time</h3>
              <ul>
                {evaluation.feedback.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="ad-craft-results__praise">
              <Icon name="heart" size={16} /> Every wish on the brief, granted.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
