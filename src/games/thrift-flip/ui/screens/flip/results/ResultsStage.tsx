import { useSettings } from "../../../../../../studio/SettingsContext";
import { Avatar } from "../../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../../ui/kit/Button";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { StarRating } from "../../../../../../ui/kit/StarRating";
import { TagPill } from "../../../../../../ui/kit/TagPill";
import { useCountUp } from "../../../../../../ui/kit/useCountUp";
import { clientById, lastResult, mainFind, recipeById } from "../../../../core";
import { LeafMeter } from "../../../art/LeafMeter";
import { Awning } from "../../../art/Awning";
import { QUALITY_LABELS, QUALITY_ORDER } from "../qualityTerms";
import type { StageProps } from "../stageProps";
import { BeforeAfter } from "./BeforeAfter";
import "./results.css";

export function ResultsStage({ state, run, onExit }: StageProps) {
  const { reducedMotion } = useSettings();
  const entry = lastResult(state);
  const evaluation = entry?.runId === run.id ? entry.evaluation : null;
  const reward = entry?.runId === run.id ? entry.reward : null;
  const score = useCountUp(evaluation?.score ?? 0, 900, 300, reducedMotion);
  const name = run.design.recipeId === null ? "Your flip" : recipeById(run.design.recipeId).name;
  const client = run.brief === null ? undefined : clientById(run.brief.clientId);
  if (evaluation === null) return null;
  const happy = reward === null || reward.outcome === "pass";
  return (
    <div className="tf-results" data-testid="results">
      <Awning className="tf-results__awning" />
      <header className="tf-results__head">
        <span className="ad-eyebrow">{run.brief === null ? "Ready for Stall Day" : "Order delivered"}</span>
        <h1>
          {run.brief === null
            ? `${name} is on the rack!`
            : happy
              ? "Brought back to life!"
              : "Handed over with care"}
        </h1>
      </header>
      <BeforeAfter run={run} main={mainFind(run)} name={name} />
      <div className="tf-results__grid">
        <section className="tf-results__score" aria-label="Score">
          <span className="tf-results__number" aria-label={`Score ${evaluation.score} out of 100`}>
            {score}
          </span>
          <StarRating stars={evaluation.stars} size={22} />
          <LeafMeter leaves={evaluation.leaves.leaves} />
          {reward?.leafPick === true ? (
            <TagPill tone="sage">
              <Icon name="heart" size={12} /> Leaf Pick
            </TagPill>
          ) : null}
          {client !== undefined ? (
            <figure className="tf-results__client">
              <Avatar
                look={client.look}
                mood={happy ? "delighted" : "thinking"}
                size={72}
                frameColour="#e2f4ea"
                title={client.name}
              />
              <blockquote>“{happy ? client.lines.delighted : client.lines.nearMiss}”</blockquote>
            </figure>
          ) : (
            <p className="ad-muted">Price it fairly on Stall Day. Fair prices bring regulars back.</p>
          )}
        </section>
        <section className="tf-results__details" aria-label="How it went">
          {evaluation.criteria.length > 0 ? (
            <ul className="tf-results__criteria">
              {evaluation.criteria.map((criterion) => (
                <li
                  key={criterion.id}
                  className={
                    criterion.passed ? "tf-criterion tf-criterion--pass" : "tf-criterion tf-criterion--miss"
                  }
                >
                  <span className="tf-criterion__mark" aria-hidden="true">
                    {criterion.passed ? <Icon name="check" size={14} /> : "!"}
                  </span>
                  <span>
                    <strong>{criterion.label}</strong>
                    <small>{criterion.detail}</small>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="tf-results__criteria">
              {QUALITY_ORDER.map((term) => (
                <li key={term} className="tf-criterion tf-criterion--pass">
                  <span className="tf-criterion__mark" aria-hidden="true">
                    <Icon name="star" size={14} />
                  </span>
                  <span>
                    <strong>{QUALITY_LABELS[term]}</strong>
                    <small>{Math.round(evaluation.quality[term] * 100)}%</small>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {evaluation.feedback.length > 0 ? (
            <div className="tf-results__feedback">
              <span className="ad-eyebrow">Next time</span>
              {evaluation.feedback.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ) : null}
          {reward !== null ? (
            <div className="tf-results__reward">
              <ul>
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
              <div className="tf-results__totals">
                <span className="tf-results__total tf-results__total--coins">
                  <Icon name="coin" size={18} /> {reward.coins >= 0 ? "+" : ""}
                  {reward.coins}
                </span>
                <span className="tf-results__total">
                  <Icon name="star" size={18} /> {reward.reputation >= 0 ? "+" : ""}
                  {reward.reputation}
                </span>
                <span className="tf-results__total">
                  <Icon name="megaphone" size={18} /> +{reward.buzz}
                </span>
              </div>
            </div>
          ) : null}
        </section>
      </div>
      <footer className="tf-results__foot">
        <Button size="lg" icon="home" onClick={onExit} data-testid="results-exit">
          Back to the stall
        </Button>
      </footer>
    </div>
  );
}
