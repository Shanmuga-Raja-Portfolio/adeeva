import { useSettings } from "../../../../../studio/SettingsContext";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { StarRating } from "../../../../../ui/kit/StarRating";
import { useCountUp } from "../../../../../ui/kit/useCountUp";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import {
  clientById,
  cuisineById,
  dishById,
  entriesFor,
  mentorFor,
  testById,
  type DishEvaluation,
  type LogEntry,
  type OrderEvaluation,
  type Reward,
} from "../../../core";
import { chefWhites } from "../../art/chefWhites";
import { KitchenBackdrop } from "../../art/KitchenBackdrop";
import { PlateArt } from "../../art/PlateArt";
import { PlateSparkles } from "../../art/PlateSparkles";
import { ScoreRosette } from "../../art/ScoreRosette";
import type { StageProps } from "./stageProps";
import { SegmentSummary } from "./SegmentSummary";
import "./results.css";

function RewardLines({ reward }: { readonly reward: Reward }) {
  return (
    <ul className="ck-results__lines" aria-label="Where the coins came from">
      {reward.lines.map((line) => (
        <li key={line.label} className={line.amount >= 0 ? undefined : "ck-results__line--minus"}>
          {line.label}{" "}
          <strong>
            {line.amount >= 0 ? "+" : ""}
            {line.amount}
          </strong>
        </li>
      ))}
    </ul>
  );
}

function Totals({ reward, instant }: { readonly reward: Reward; readonly instant: boolean }) {
  const coins = useCountUp(reward.coins, 900, 300, instant);
  return (
    <div className="ck-results__earned">
      <div className="ck-results__earned-head">
        <span className="ck-results__earned-label">You earned</span>
        <RewardLines reward={reward} />
      </div>
      <div className="ck-results__totals" data-testid="reward-totals">
        <span className="ck-results__reward ck-results__reward--coins" data-count-target={reward.coins}>
          <Icon name="coin" size={24} />
          <span>
            +<span data-count-value="">{coins}</span> coins
          </span>
        </span>
        <span className="ck-results__reward ck-results__reward--rep">
          <Icon name="star" size={24} /> {reward.reputation >= 0 ? "+" : ""}
          {reward.reputation} rep
        </span>
        <span className="ck-results__reward ck-results__reward--buzz">
          <Icon name="megaphone" size={24} /> +{reward.buzz} buzz
        </span>
      </div>
    </div>
  );
}

function Criteria({ evaluation }: { readonly evaluation: DishEvaluation | OrderEvaluation }) {
  return (
    <>
      <ul className="ck-results__criteria">
        {evaluation.criteria.map((criterion) => (
          <li
            key={criterion.id}
            className={
              criterion.passed ? "ck-results__criterion ck-results__criterion--pass" : "ck-results__criterion"
            }
          >
            <span className="ck-results__mark" aria-hidden="true">
              {criterion.passed ? <Icon name="check" size={12} /> : "·"}
            </span>
            <strong>{criterion.label}</strong>
            <span className="ck-muted">{criterion.detail}</span>
          </li>
        ))}
      </ul>
      {evaluation.feedback.length > 0 ? (
        <div className="ck-results__feedback">
          {evaluation.feedback.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ) : null}
    </>
  );
}

function headline(
  entries: readonly LogEntry[],
  fallback: string,
): { readonly eyebrow: string; readonly title: string } {
  const order = entries.find((entry) => entry.kind === "order");
  if (order?.kind === "order") {
    const name = clientById(order.clientId)?.name ?? "Your guest";
    return order.reward.outcome === "pass"
      ? { eyebrow: "Order delivered", title: `${name} loved it!` }
      : { eyebrow: "A kind note", title: `${name} says thank you` };
  }
  const test = entries.find((entry) => entry.kind === "test");
  if (test?.kind === "test")
    return test.passed
      ? { eyebrow: testById(test.test).name, title: "You passed!" }
      : { eyebrow: testById(test.test).name, title: "Not this time" };
  return { eyebrow: "Service!", title: fallback };
}

export function ResultsStage({ state, run, dispatch, onExit }: StageProps) {
  const { reducedMotion } = useSettings();
  const once = useDispatchOnce(state, dispatch);
  const dish = dishById(run.dishId);
  const cuisine = cuisineById(dish.cuisine);
  const entries = entriesFor(state.log, run.id);
  const dishEntry = entries.find((entry) => entry.kind === "dish");
  const orderEntry = entries.find((entry) => entry.kind === "order");
  const testEntry = entries.find((entry) => entry.kind === "test");
  const plated = run.plated;
  const quality = dishEntry?.kind === "dish" ? dishEntry.quality : 0;
  const stars = dishEntry?.kind === "dish" ? dishEntry.stars : 1;
  const mentor = run.purpose.kind === "lesson" ? mentorFor(run.purpose.cuisine) : null;
  const lessonPassed = dishEntry?.kind === "dish" && dishEntry.reward?.outcome === "pass";
  const title = headline(
    entries,
    mentor === null
      ? run.purpose.kind === "segment"
        ? "That's a wrap!"
        : `${dish.name}, served!`
      : lessonPassed
        ? `${mentor.name} is proud!`
        : `${mentor.name} says well tried`,
  );
  const segment = run.purpose.kind === "segment" && state.path?.kind === "tv" ? state.path.lastSegment : null;
  const testDay = state.testDay;
  const nextTest =
    testDay !== null && run.purpose.kind === "test" ? testDay.dishIds[testDay.qualities.length] : undefined;
  const reward =
    orderEntry?.kind === "order" ? orderEntry.reward : dishEntry?.kind === "dish" ? dishEntry.reward : null;
  const evaluation =
    orderEntry?.kind === "order"
      ? orderEntry.evaluation
      : dishEntry?.kind === "dish"
        ? dishEntry.evaluation
        : null;
  const shownStars = segment?.stars ?? evaluation?.stars ?? stars;
  return (
    <div className="ck-results" data-testid="results">
      <div className="ck-results__scene">
        <KitchenBackdrop scene="counter" cuisine={dish.cuisine} className="ck-results__backdrop" />
        <div className="ck-results__glow" aria-hidden="true" />
        {plated !== null ? (
          <div className="ck-results__dish">
            {shownStars >= 4 ? <div className="ck-burst" aria-hidden="true" /> : null}
            <PlateArt
              colour={plated.plateColour}
              components={plated.components}
              title={`Your ${dish.name}`}
              className={reducedMotion ? "ck-results__plate" : "ck-results__plate ck-results__plate--slide"}
            />
            {shownStars >= 4 ? <PlateSparkles className="ck-results__sparkles" /> : null}
            <ScoreRosette stars={shownStars} className="ck-results__rosette" />
          </div>
        ) : null}
        {mentor !== null ? (
          <div className="ck-results__host">
            <Avatar
              look={mentor.look}
              garment={chefWhites(cuisine.accent)}
              mood={lessonPassed ? "delighted" : "happy"}
              size={124}
              title={mentor.name}
              frameColour={cuisine.wall}
            />
            <blockquote className="ck-results__quote">
              <p>“{lessonPassed ? mentor.passLine : mentor.nearMissLine}”</p>
              <cite>{mentor.name}</cite>
            </blockquote>
          </div>
        ) : null}
      </div>
      <section className="ck-results__card ck-card">
        <span className="ad-eyebrow">{segment === null ? title.eyebrow : "Spoon & Story, live"}</span>
        <h1>{title.title}</h1>
        <div className="ck-results__stars" data-stars={shownStars}>
          <StarRating stars={shownStars} size={28} />
          <strong>
            {segment !== null
              ? `Segment ${segment.score} / 100`
              : evaluation === null
                ? `Quality ${quality}`
                : `${evaluation.score} / 100`}
          </strong>
        </div>
        <p className="ck-results__quality">
          <span className="ck-results__quality-item">
            <Icon name="heart" size={20} /> Dish quality {quality}
          </span>
          {dishEntry?.kind === "dish" && dishEntry.mastery > 0 ? (
            <span className="ck-results__mastery">
              <Icon name="star" size={18} /> {cuisine.name} mastery +{dishEntry.mastery}
            </span>
          ) : null}
        </p>
        {evaluation !== null ? <Criteria evaluation={evaluation} /> : null}
        <SegmentSummary state={state} run={run} />
        {testEntry?.kind === "test" ? (
          <div className="ck-results__test">
            <p>
              Scores: {testEntry.scores.join(", ")} · needed {testEntry.mark}
              {testEntry.test === "graduation" ? " on average" : " each"}
            </p>
            {testEntry.feedback.map((line) => (
              <p key={line} className="ck-results__feedback">
                {line}
              </p>
            ))}
            {testEntry.passed ? <p className="ck-good">+3 reputation, and a new rung!</p> : null}
          </div>
        ) : null}
        {run.purpose.kind === "order" && orderEntry === undefined ? (
          <p className="ck-muted">One dish ready. Cook the rest of the order to deliver it.</p>
        ) : null}
        {run.purpose.kind === "practice" ? (
          <p className="ck-muted">Practice makes progress. Your plating card is updated.</p>
        ) : null}
        {reward !== null ? <Totals reward={reward} instant={reducedMotion} /> : null}
        <div className="ck-results__actions">
          {nextTest !== undefined ? (
            <Button
              size="lg"
              icon="sparkle"
              onClick={(event) => {
                if (once(event, { type: "startNextTestDish" })) window.scrollTo({ top: 0 });
              }}
              data-testid="next-test-dish"
            >
              Next: {dishById(nextTest).name}
            </Button>
          ) : null}
          <Button
            size="lg"
            variant={nextTest === undefined ? "primary" : "secondary"}
            onClick={onExit}
            data-testid="results-exit"
          >
            Back to the kitchen
          </Button>
        </div>
      </section>
    </div>
  );
}
