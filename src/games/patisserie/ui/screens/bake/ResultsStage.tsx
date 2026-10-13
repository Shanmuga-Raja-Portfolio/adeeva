import type { CSSProperties } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { Meter } from "../../../../../ui/kit/Meter";
import { StarRating } from "../../../../../ui/kit/StarRating";
import { useCountUp } from "../../../../../ui/kit/useCountUp";
import { clientById, lastResult, productById } from "../../../core";
import { BakePreview } from "../../art/BakePreview";
import { bakeLook, icingHex } from "../../art/bakeLook";
import { GiftBox } from "../../art/GiftBox";
import type { StageProps } from "./stageProps";
import "./results.css";

function delay(index: number): CSSProperties {
  return { "--reveal": index } as CSSProperties;
}

function signed(amount: number): string {
  return amount > 0 ? `+${amount}` : String(amount);
}

export function ResultsStage({ state, run, onExit }: StageProps) {
  const { reducedMotion } = useSettings();
  const entry = lastResult(state, run.id);
  const score = useCountUp(entry?.evaluation.score ?? 0, 1400, 900, reducedMotion);
  const look = bakeLook(run.design, run.toppings, run.purpose.kind === "order");
  const productName = run.design.productId === null ? "bake" : productById(run.design.productId).name;
  if (look === null) return null;
  if (entry === null) {
    const tray = state.counter.trays[state.counter.trays.length - 1];
    return (
      <div className={reducedMotion ? "pa-results pa-results--still" : "pa-results"} data-testid="results">
        <section className="pa-results__hero">
          <GiftBox ribbon="#a9c98b">
            <BakePreview look={look} title={`A tray of ${productName}`} />
          </GiftBox>
          <div className="pa-results__verdict">
            <span className="ad-eyebrow">Counter tray</span>
            <h1>On the counter!</h1>
            <p className="pa-results__quote">
              Six fresh treats wait under the glass{tray !== undefined ? `, quality ${tray.quality}` : ""}.
              Sell them on Counter Day.
            </p>
            <Button size="lg" onClick={onExit} data-testid="results-exit">
              Back to the shop
            </Button>
          </div>
        </section>
      </div>
    );
  }
  const { evaluation, reward } = entry;
  const client = clientById(entry.clientId);
  const happy = reward.outcome === "pass";
  const quality = evaluation.quality;
  const headline = happy
    ? `${client?.name ?? "They"} loved it!`
    : reward.outcome === "soft-fail"
      ? "A near miss"
      : "Not quite this time";
  return (
    <div className={reducedMotion ? "pa-results pa-results--still" : "pa-results"} data-testid="results">
      <section className="pa-results__hero">
        <GiftBox ribbon={icingHex(look, 1)}>
          <BakePreview look={look} title={`The ${productName}, out of its box`} />
        </GiftBox>
        <div className="pa-results__verdict">
          <span className="ad-eyebrow">{run.brief?.occasion ?? "Delivered"}</span>
          <h1>{headline}</h1>
          {client !== undefined ? (
            <div className="pa-results__thanks">
              <Avatar
                look={client.look}
                mood={happy ? "delighted" : "thinking"}
                size={72}
                title={client.name}
              />
              <blockquote className="pa-results__quote">
                “{happy ? client.lines.delighted : client.lines.nearMiss}”
              </blockquote>
            </div>
          ) : null}
          <div className="pa-results__score">
            <span className="pa-results__number" aria-label={`Score ${evaluation.score} out of 100`}>
              {score}
            </span>
            <span className="pa-muted">/ 100</span>
            <StarRating stars={evaluation.stars} size={30} />
          </div>
          <div className="pa-results__rewards" style={delay(2)}>
            <ul>
              {reward.lines.map((line) => (
                <li key={line.label}>
                  <span>{line.label}</span>
                  <strong>{signed(line.amount)} coins</strong>
                </li>
              ))}
            </ul>
            <div className="pa-results__totals" data-testid="reward-totals">
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
              <p className="pa-results__trend">
                <Icon name="sparkle" size={16} /> Town favourite: {reward.trendMatches.join(", ")}
              </p>
            ) : null}
          </div>
          <p className="pa-results__book">
            <Icon name="heart" size={16} /> Added to your Bake Book.
          </p>
          <Button size="lg" onClick={onExit} data-testid="results-exit">
            Back to the shop
          </Button>
        </div>
      </section>
      <section className="pa-results__details">
        <div className="pa-results__panel">
          <h2>How it measured up</h2>
          <ul className="pa-results__criteria">
            {evaluation.criteria.map((criterion, index) => (
              <li
                key={criterion.id}
                className={
                  criterion.passed ? "pa-criterion pa-criterion--passed" : "pa-criterion pa-criterion--missed"
                }
                style={delay(index + 3)}
              >
                <span className="pa-criterion__mark" aria-hidden="true">
                  {criterion.passed ? <Icon name="check" size={16} /> : "•"}
                </span>
                <span>
                  <strong>{criterion.label}</strong>
                  <span className="pa-muted"> {criterion.detail}</span>
                </span>
                <span className="ad-visually-hidden">{criterion.passed ? "passed" : "missed"}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="pa-results__panel">
          <h2>Baking skills · {quality.quality}</h2>
          <Meter
            label="Weighing"
            value={Math.round(quality.weigh * 100)}
            valueText={`${Math.round(quality.weigh * 100)}%`}
          />
          <Meter
            label="Stirring"
            tone="sage"
            value={Math.round(quality.stir * 100)}
            valueText={`${Math.round(quality.stir * 100)}%`}
          />
          <Meter
            label="Oven"
            tone="gold"
            value={Math.round(quality.bake * 100)}
            valueText={`${Math.round(quality.bake * 100)}%`}
          />
          <Meter
            label="Piping"
            tone="ink"
            value={Math.round(quality.pipe * 100)}
            valueText={`${Math.round(quality.pipe * 100)}%`}
          />
          {evaluation.feedback.length > 0 ? (
            <div className="pa-results__notes">
              <h3>Notes for next time</h3>
              <ul>
                {evaluation.feedback.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="pa-results__praise">
              <Icon name="heart" size={16} /> Every wish on the order, granted.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
