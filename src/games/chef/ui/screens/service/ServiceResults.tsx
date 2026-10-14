import { useSettings } from "../../../../../studio/SettingsContext";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { StarRating } from "../../../../../ui/kit/StarRating";
import { useCountUp } from "../../../../../ui/kit/useCountUp";
import { cuisineById, dishById, type GameState, type ServiceLogEntry } from "../../../core";
import { KitchenBackdrop } from "../../art/KitchenBackdrop";
import "../dish/results.css";
import "./serviceResults.css";

function Totals({ entry, instant }: { readonly entry: ServiceLogEntry; readonly instant: boolean }) {
  const total = entry.wage + entry.reward.coins + (entry.special?.bonus ?? 0);
  const coins = useCountUp(total, 900, 300, instant);
  const rep = entry.reward.reputation + (entry.special?.soldOut === true ? 1 : 0);
  return (
    <div className="ck-results__totals" data-testid="reward-totals">
      <span>
        <Icon name="coin" size={20} /> +{coins} coins
      </span>
      <span>
        <Icon name="star" size={20} /> {rep >= 0 ? "+" : ""}
        {rep} rep
      </span>
      <span>
        <Icon name="megaphone" size={20} /> +{entry.reward.buzz} buzz
      </span>
    </div>
  );
}

export function ServiceResults({
  state,
  onExit,
}: {
  readonly state: GameState;
  readonly onExit: () => void;
}) {
  const { reducedMotion } = useSettings();
  const entry = [...state.log].reverse().find((item): item is ServiceLogEntry => item.kind === "service");
  if (entry === undefined)
    return (
      <main className="ck-service-results ad-screen">
        <h1>The service is over</h1>
        <Button onClick={onExit}>Back to the kitchen</Button>
      </main>
    );
  const test = entry.service === "station-test";
  const counters = entry.cuisines.map((cuisine) => cuisineById(cuisine).counter).join(" + ");
  return (
    <main className="ck-service-results ad-screen" data-testid="service-results">
      <KitchenBackdrop scene="kitchen" className="ck-service-results__backdrop" />
      <section className="ck-service-results__card ck-card">
        <span className="ad-eyebrow">
          {test ? "Station Test" : counters.length > 0 ? `Service at ${counters}` : "Hall dinner service"}
        </span>
        <h1>{entry.passed ? (test ? "Your counter, chef!" : "What a service!") : "Everyone got fed"}</h1>
        <div className="ck-results__stars">
          <StarRating stars={entry.stars} size={28} />
          <strong>{entry.score} / 100</strong>
        </div>
        <ul className="ck-service-results__meters">
          <li>
            <span>Dish quality</span>
            <strong>{entry.averageQuality}</strong>
          </li>
          <li>
            <span>Tickets on time</span>
            <strong>{Math.round(entry.averageOnTime * 100)}%</strong>
          </li>
          <li>
            <span>Dishes you cooked</span>
            <strong>{Math.round(entry.handledShare * 100)}%</strong>
          </li>
          <li>
            <span>Finished by the team</span>
            <strong>
              {entry.teamTickets} {entry.teamTickets === 1 ? "ticket" : "tickets"}
            </strong>
          </li>
        </ul>
        {entry.feedback.length > 0 ? (
          <div className="ck-results__feedback">
            {entry.feedback.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : null}
        {entry.special !== null ? (
          <div className="ck-service-results__special">
            <span className="ck-chalk">Today's special: {dishById(entry.special.special.dishId).name}</span>
            <p>
              {entry.special.sold} of 12 sold{entry.special.soldOut ? ": sold out!" : "."} Special bonus{" "}
              {entry.special.bonus} coins.
            </p>
          </div>
        ) : null}
        {entry.mastery.length > 0 ? (
          <p className="ck-good">
            Mastery:{" "}
            {entry.mastery.map((gain) => `${cuisineById(gain.cuisine).name} +${gain.gain}`).join(", ")}
          </p>
        ) : null}
        <ul className="ck-results__lines">
          {entry.wage > 0 ? (
            <li>
              <span>Wage for the shift</span>
              <strong>+{entry.wage}</strong>
            </li>
          ) : null}
          {entry.reward.lines.map((line) => (
            <li key={line.label}>
              <span>{line.label === "Fee" ? "Service bonus" : line.label}</span>
              <strong>
                {line.amount >= 0 ? "+" : ""}
                {line.amount}
              </strong>
            </li>
          ))}
        </ul>
        {test && entry.passed ? <p className="ck-good">+3 reputation. You're the new sous chef!</p> : null}
        {test && !entry.passed ? (
          <p className="ck-muted">Try the Station Test again tomorrow. No penalty.</p>
        ) : null}
        <Totals entry={entry} instant={reducedMotion} />
        <Button size="lg" onClick={onExit} data-testid="service-exit">
          Back to the kitchen
        </Button>
      </section>
    </main>
  );
}
