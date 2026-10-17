import type { CSSProperties } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { Meter, type MeterTone } from "../../../../../ui/kit/Meter";
import { StarRating } from "../../../../../ui/kit/StarRating";
import { useCountUp } from "../../../../../ui/kit/useCountUp";
import { clientById, fairDayOf, flourishById, isCustomBake, lastResult, productById } from "../../../core";
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

function skillLevel(percent: number): readonly [MeterTone, string] {
  if (percent >= 90) return ["sage", "Super"];
  if (percent >= 70) return ["gold", "Good"];
  return ["rose", "Keep practising"];
}

function SkillMeter({ label, share }: { readonly label: string; readonly share: number }) {
  const percent = Math.round(share * 100);
  const [tone, word] = skillLevel(percent);
  return (
    <Meter
      label={label}
      tone={tone}
      value={percent}
      valueText={`${percent}% · ${word}`}
      className="pa-results__skill"
    />
  );
}

export function ResultsStage({ state, run, onExit }: StageProps) {
  const { reducedMotion } = useSettings();
  const entry = lastResult(state, run.id);
  const score = useCountUp(entry?.evaluation.score ?? 0, 1400, 900, reducedMotion);
  const look = bakeLook(run.design, run.toppings, run.purpose.kind !== "tray");
  const productName = run.design.productId === null ? "bake" : productById(run.design.productId).name;
  if (look === null) return null;
  const fairEntry = state.fair?.entry ?? null;
  if (entry === null && run.purpose.kind === "showpiece" && fairEntry !== null && state.fair !== null)
    return (
      <div className={reducedMotion ? "pa-results pa-results--still" : "pa-results"} data-testid="results">
        <section className="pa-results__hero">
          <GiftBox ribbon="#c9a227">
            <BakePreview look={look} title={`Your ${productName} showpiece`} plaque={run.word} />
          </GiftBox>
          <div className="pa-results__verdict">
            <span className="ad-eyebrow">{run.brief?.occasion ?? "Fair showpiece"}</span>
            <h1>Ready for the Fair!</h1>
            <p className="pa-results__quote">
              A cloth goes over it until Fair Day, day {fairDayOf(state.fair)}. Quality {fairEntry.quality}
              {fairEntry.touches.length > 0
                ? `, with ${fairEntry.touches.map((touch) => `${flourishById(touch.flourish).name} at ${Math.round(touch.accuracy * 100)}%`).join(" and ")}`
                : ""}
              .
            </p>
            <Meter
              label="Flair for the Bakers' Bench"
              value={fairEntry.flair}
              valueText={String(fairEntry.flair)}
            />
            <p className="pa-results__book">
              <Icon name="heart" size={16} /> Added to your Bake Book. Its ribbon will hang here after the
              Fair.
            </p>
            <Button size="lg" onClick={onExit} data-testid="results-exit">
              Back to the bakery
            </Button>
          </div>
        </section>
      </div>
    );
  if (entry === null && run.purpose.kind === "salon-tray") {
    const tray = state.salon?.shelf.find(
      (item) => item.tier === (run.purpose.kind === "salon-tray" ? run.purpose.tier : "top"),
    );
    return (
      <div className={reducedMotion ? "pa-results pa-results--still" : "pa-results"} data-testid="results">
        <section className="pa-results__hero">
          <GiftBox ribbon="#b9a7dc">
            <BakePreview look={look} title={`A salon tray of ${productName}`} />
          </GiftBox>
          <div className="pa-results__verdict">
            <span className="ad-eyebrow">Salon tray</span>
            <h1>On the Salon shelf!</h1>
            <p className="pa-results__quote">
              Six treats wait for Salon Day: {run.design.split} and {6 - run.design.split}
              {tray !== undefined ? `, quality ${tray.quality}` : ""}.
            </p>
            <Button size="lg" onClick={onExit} data-testid="results-exit">
              Back to the bakery
            </Button>
          </div>
        </section>
      </div>
    );
  }
  if (entry === null || !isCustomBake(run)) {
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
  const granted = evaluation.criteria.filter((criterion) => criterion.passed);
  const missed = evaluation.criteria.filter((criterion) => !criterion.passed);
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
                size={64}
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
            <span className="pa-results__outof">/ 100</span>
            <StarRating stars={evaluation.stars} size={40} />
          </div>
          <div className="pa-results__rewards" style={delay(2)}>
            <ul>
              {reward.lines.map((line) => (
                <li key={line.label}>
                  <span>
                    {line.label === "Trend bonus" && reward.trendMatches.length > 0
                      ? `The town loves ${reward.trendMatches.join(" and ")} bakes`
                      : line.label}
                  </span>
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
          <div className="pa-wishes">
            <span className="pa-wishes__count">
              <strong>{granted.length}</strong> of {evaluation.criteria.length} wishes
            </span>
            <span
              className="pa-wishes__hearts"
              role="img"
              aria-label={`Wishes met: ${granted.map((criterion) => criterion.label).join(", ")}`}
            >
              {evaluation.criteria.map((criterion, index) => (
                <span
                  key={criterion.id}
                  className={
                    criterion.passed ? "pa-wishes__heart" : "pa-wishes__heart pa-wishes__heart--missed"
                  }
                  style={delay(index + 3)}
                  title={criterion.label}
                >
                  <Icon name="heart" size={22} />
                </span>
              ))}
            </span>
          </div>
          {missed.length > 0 ? (
            <ul className="pa-results__criteria">
              {missed.map((criterion, index) => (
                <li key={criterion.id} className="pa-criterion" style={delay(index + 3)}>
                  <span className="pa-criterion__mark" aria-hidden="true">
                    •
                  </span>
                  <span>
                    <strong>{criterion.label}</strong>{" "}
                    <span className="pa-criterion__detail">{criterion.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="pa-results__praise">
              <Icon name="heart" size={18} /> Every wish on the order, granted.
            </p>
          )}
        </div>
        <div className="pa-results__panel">
          <h2>Baking skills · {quality.quality}</h2>
          <div className="pa-results__skills">
            <SkillMeter label="Weighing" share={quality.weigh} />
            <SkillMeter label="Stirring" share={quality.stir} />
            <SkillMeter label="Oven" share={quality.bake} />
            <SkillMeter label="Piping" share={quality.pipe} />
          </div>
          {evaluation.feedback.length > 0 ? (
            <div className="pa-results__notes">
              <h3>Notes for next time</h3>
              <ul>
                {evaluation.feedback.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
