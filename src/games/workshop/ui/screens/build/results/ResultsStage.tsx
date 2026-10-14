import { useEffect, type CSSProperties } from "react";
import { AvatarFigure } from "../../../../../../ui/art/avatar/Avatar";
import { DOLL_VIEWBOX } from "../../../../../../ui/art/avatar/Croquis";
import { useSettings } from "../../../../../../studio/SettingsContext";
import { Button } from "../../../../../../ui/kit/Button";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { Meter } from "../../../../../../ui/kit/Meter";
import { StarRating } from "../../../../../../ui/kit/StarRating";
import { useArmedAfter } from "../../../../../../ui/kit/useArmedAfter";
import { useCountUp } from "../../../../../../ui/kit/useCountUp";
import { clientById, kidSummary, lastResult, productById, woodById } from "../../../../core";
import { DeliveryScene } from "../../../art/DeliveryScene";
import { PiecePreview } from "../../../art/PiecePreview";
import { pieceLook } from "../../../art/pieceLook";
import type { StageProps } from "../stageProps";
import "./results.css";

const EXIT_ARM_MS = 700;

function reveal(index: number): CSSProperties {
  return { "--reveal": index } as CSSProperties;
}

function signed(amount: number): string {
  return amount > 0 ? `+${amount}` : String(amount);
}

function percent(share: number): string {
  return `${Math.round(share * 100)}%`;
}

export function ResultsStage({ state, run, onExit }: StageProps) {
  const { reducedMotion } = useSettings();
  const entry = lastResult(state, run.id);
  const score = useCountUp(entry?.evaluation.score ?? 0, 1400, 900, reducedMotion);
  const client = clientById(run.brief.clientId);
  const look = pieceLook(run);
  const exitArmed = useArmedAfter(EXIT_ARM_MS);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);
  if (entry === null || look === null || client === undefined) return null;
  const { evaluation, reward } = entry;
  const happy = reward.outcome === "pass";
  const quality = evaluation.quality;
  const productName = productById(entry.productId).name;
  const headline = happy
    ? `${client.name} loves it!`
    : reward.outcome === "soft-fail"
      ? "A near miss"
      : "Not quite this time";
  const lines = kidSummary(evaluation, run);
  return (
    <div className={reducedMotion ? "ww-results ww-results--still" : "ww-results"} data-testid="results">
      <section className="ww-results__hero">
        <div className="ww-results__scene">
          <DeliveryScene
            scene={client.scene}
            label={`${client.name}'s new ${productName} in its new home`}
            className="ww-results__backdrop"
          >
            <svg x={230} y={190} width={380} height={285} viewBox="0 0 400 300" className="ww-results__piece">
              <PiecePreview look={look} title={null} threeQuarter />
            </svg>
            <svg
              x={40}
              y={150}
              width={180}
              height={360}
              viewBox={DOLL_VIEWBOX}
              className="ww-results__client"
            >
              <AvatarFigure look={client.look} mood={happy ? "delighted" : "thinking"} />
            </svg>
          </DeliveryScene>
          {happy && !reducedMotion ? (
            <div className="ww-results__confetti" aria-hidden="true">
              {Array.from({ length: 18 }, (_, index) => (
                <span key={index} style={{ "--i": index } as CSSProperties} />
              ))}
            </div>
          ) : null}
        </div>
        <div className="ww-results__verdict ww-paper ww-tape">
          <span className="ad-eyebrow">
            {run.brief.occasion} · {woodById(entry.woodId).name}
          </span>
          <h1>{headline}</h1>
          <blockquote className="ww-results__quote">
            “{happy ? client.lines.delighted : client.lines.nearMiss}”
          </blockquote>
          <ul className="ww-results__kid">
            {lines.map((line, index) => (
              <li
                key={line.id}
                className={
                  line.good ? "ww-results__kid-line" : "ww-results__kid-line ww-results__kid-line--soft"
                }
                style={reveal(index)}
              >
                <strong>{line.label}:</strong> {line.verdict}
              </li>
            ))}
          </ul>
          <div className="ww-results__score">
            <span className="ww-results__number" aria-label={`Score ${evaluation.score} out of 100`}>
              {score}
            </span>
            <span className="ww-muted">/ 100</span>
            <StarRating stars={evaluation.stars} size={30} />
          </div>
          <div className="ww-results__rewards">
            <ul>
              {reward.lines.map((line) => (
                <li key={line.label}>
                  <span>{line.label}</span>
                  <strong>{signed(line.amount)} coins</strong>
                </li>
              ))}
            </ul>
            <div className="ww-results__totals" data-testid="reward-totals">
              <span>
                <Icon name="coin" size={18} /> {signed(reward.coins)}
              </span>
              <span>
                <Icon name="star" size={18} /> {signed(reward.reputation)} rep
              </span>
              <span>
                <Icon name="megaphone" size={18} /> {signed(reward.buzz)} buzz
              </span>
            </div>
            {reward.trendMatches.length > 0 ? (
              <p className="ww-results__trend">
                <Icon name="sparkle" size={16} /> Neighbourhood favourite: {reward.trendMatches.join(", ")}
              </p>
            ) : null}
          </div>
          <Button size="lg" onClick={onExit} disabled={!exitArmed} data-testid="results-exit">
            Back to the garage
          </Button>
        </div>
      </section>
      <section className="ww-results__details">
        <div className="ww-results__panel ww-paper">
          <h2>How it measured up</h2>
          <ul className="ww-results__criteria">
            {evaluation.criteria.map((criterion) => (
              <li
                key={criterion.id}
                className={
                  criterion.passed ? "ww-criterion ww-criterion--passed" : "ww-criterion ww-criterion--missed"
                }
              >
                <span className="ww-criterion__mark" aria-hidden="true">
                  {criterion.passed ? <Icon name="check" size={16} /> : "•"}
                </span>
                <span>
                  <strong>{criterion.label}</strong>
                  <span className="ww-muted"> {criterion.detail}</span>
                </span>
                <span className="ad-visually-hidden">{criterion.passed ? "passed" : "missed"}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="ww-results__panel ww-paper">
          <h2>Maker skills · quality {quality.quality}</h2>
          <Meter label="Sawing" value={Math.round(quality.saw * 100)} valueText={percent(quality.saw)} />
          <Meter
            label="Joints"
            tone="sage"
            value={Math.round(quality.join * 100)}
            valueText={percent(quality.join)}
          />
          <Meter
            label="Sanding"
            tone="gold"
            value={Math.round(quality.sand * 100)}
            valueText={percent(quality.sand)}
          />
          <Meter
            label="Wood lines"
            tone="ink"
            value={Math.round(quality.grain * 100)}
            valueText={percent(quality.grain)}
          />
          <Meter
            label="Right wood"
            tone="sage"
            value={Math.round(quality.woodFit * 100)}
            valueText={quality.woodFit === 1 ? "Yes" : "Not quite"}
          />
          {evaluation.feedback.length > 0 ? (
            <div className="ww-results__notes">
              <h3>Notes for next time</h3>
              <ul>
                {evaluation.feedback.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="ww-results__praise">
              <Icon name="heart" size={16} /> Every wish on the note, granted.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
