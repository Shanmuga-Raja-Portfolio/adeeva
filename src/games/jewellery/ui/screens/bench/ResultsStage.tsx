import { useSettings } from "../../../../../studio/SettingsContext";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { StarRating } from "../../../../../ui/kit/StarRating";
import { useCountUp } from "../../../../../ui/kit/useCountUp";
import {
  clientById,
  finishById,
  lastResult,
  pieceQuality,
  productById,
  runSource,
  type Evaluation,
  type LogEntry,
} from "../../../core";
import { DeliveryScene } from "../../art/DeliveryScene";
import { GiftBox } from "../../art/GiftBox";
import { PiecePreview } from "../../art/PiecePreview";
import { qualityRows } from "./qualityRows";
import type { StageProps } from "./stageProps";
import "./results.css";

function kidSummary(evaluation: Evaluation, wantedExtras: boolean): string[] {
  const lines = qualityRows(evaluation.quality)
    .filter((row) => row.label !== "Metal choice")
    .map((row) => `${row.label}: ${row.praise}`);
  const extras = evaluation.criteria.find((criterion) => criterion.id === "extras");
  if (extras !== undefined && !extras.passed) lines.push(`Extras: ${extras.detail}`);
  else if (wantedExtras) lines.push("Extras: all there!");
  return lines;
}

function Totals({ entry, instant }: { readonly entry: LogEntry; readonly instant: boolean }) {
  const coins = useCountUp(entry.reward.coins, 900, 300, instant);
  return (
    <div className="jb-results__totals" data-testid="reward-totals">
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
  const product = productById(run.design.productId);
  const entry = lastResult(state, run.id);
  const source = runSource(run);
  if (entry === null || run.brief === null) {
    const quality = pieceQuality(state, run).quality;
    return (
      <div className="jb-results jb-results--stall" data-testid="results">
        <section className="jb-results__card jb-measure">
          <span className="ad-eyebrow">Market Day treasure</span>
          <h1>Into the stall box!</h1>
          <PiecePreview
            source={source}
            title={`Your ${product.name}`}
            twinkle
            className="jb-results__stall-piece"
          />
          <p className="jb-results__quality">
            <Icon name="star" size={18} /> Quality {quality}
          </p>
          <Button size="lg" onClick={onExit} data-testid="results-exit">
            Back to the arcade
          </Button>
        </section>
      </div>
    );
  }
  const client = clientById(entry.clientId);
  const { evaluation, reward } = entry;
  const happy = reward.outcome === "pass";
  const name = client?.name ?? "Your neighbour";
  const finish = finishById(run.display.finish);
  return (
    <div className="jb-results" data-testid="results">
      <div className="jb-results__scene">
        <DeliveryScene scene={client?.scene ?? "kitchen"} className="jb-results__backdrop" />
        <div className="jb-results__table">
          <svg viewBox="0 0 240 240" className="jb-results__gift" aria-hidden="true">
            <GiftBox open />
          </svg>
          <PiecePreview
            source={source}
            title={`${name}'s ${product.name}`}
            twinkle={!reducedMotion}
            className="jb-results__piece"
          />
        </div>
        {client !== undefined ? (
          <div className="jb-results__client">
            <Avatar
              look={client.look}
              mood={happy ? "delighted" : "happy"}
              size={120}
              title={client.name}
              frameColour="#fbe9c8"
            />
            <blockquote className="jb-results__quote">
              “{happy ? client.lines.delighted : client.lines.nearMiss}”
            </blockquote>
          </div>
        ) : null}
      </div>
      <section className="jb-results__card jb-measure">
        <span className="ad-eyebrow">{happy ? "Delivered with a ribbon" : "A kind note"}</span>
        <h1>{happy ? `${name} loved it!` : `${name} says thank you`}</h1>
        <div className="jb-results__stars">
          <StarRating stars={evaluation.stars} size={28} />
          <strong>{evaluation.score} / 100</strong>
        </div>
        <ul className="jb-results__summary">
          {kidSummary(evaluation, run.brief.requiredExtras.length > 0).map((line) => (
            <li key={line}>
              <Icon name="sparkle" size={14} /> {line}
            </li>
          ))}
        </ul>
        <ul className="jb-results__criteria">
          {evaluation.criteria.map((criterion) => (
            <li
              key={criterion.id}
              className={
                criterion.passed
                  ? "jb-results__criterion jb-results__criterion--pass"
                  : "jb-results__criterion"
              }
            >
              <span className="jb-results__mark" aria-hidden="true">
                {criterion.passed ? <Icon name="check" size={12} /> : "·"}
              </span>
              <strong>{criterion.label}</strong>
              <span className="jb-muted">{criterion.detail}</span>
            </li>
          ))}
        </ul>
        {evaluation.feedback.length > 0 ? (
          <div className="jb-results__feedback">
            {evaluation.feedback.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : null}
        <ul className="jb-results__lines">
          {reward.lines.map((line) => (
            <li key={line.label}>
              <span>{line.label}</span>
              <strong>
                {line.amount >= 0 ? "+" : ""}
                {line.amount}
              </strong>
            </li>
          ))}
          {finish.price > 0 ? (
            <li>
              <span>{finish.name} finish</span>
              <strong>−{finish.price}</strong>
            </li>
          ) : null}
        </ul>
        <Totals entry={entry} instant={reducedMotion} />
        <Button size="lg" onClick={onExit} data-testid="results-exit">
          Back to the arcade
        </Button>
      </section>
    </div>
  );
}
