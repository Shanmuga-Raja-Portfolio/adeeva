import type { RunwayResult } from "../../../core";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useCountUp } from "../../../../../ui/kit/useCountUp";

export interface RewardsCardProps {
  result: RunwayResult;
  coinsNow: number;
  instant: boolean;
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

export function RewardsCard({ result, coinsNow, instant }: RewardsCardProps) {
  const coins = useCountUp(result.coins, 1600, 1900, instant);
  return (
    <section className="ad-rewards" aria-labelledby="rewards-title" data-testid="show-rewards">
      <h2 id="rewards-title" className="ad-rewards__title">
        After the show
      </h2>
      <div className="ad-rewards__orders">
        <span className="ad-rewards__big">{result.orders}</span>
        <span>
          {result.orders === 1 ? "boutique order" : "boutique orders"}
          <small>
            {result.orders === 0 ? "Buyers will be back next season." : "Buyers are calling the atelier."}
          </small>
        </span>
      </div>
      <ul className="ad-rewards__list">
        <li className="ad-rewards__item ad-rewards__item--coins">
          <Icon name="coin" size={20} />
          <span>Coins</span>
          <b data-testid="reward-coins">+{coins}</b>
        </li>
        <li className="ad-rewards__item ad-rewards__item--rep">
          <Icon name="star" size={20} />
          <span>Reputation</span>
          <b>{signed(result.reputation)}</b>
        </li>
        <li className="ad-rewards__item ad-rewards__item--buzz">
          <Icon name="megaphone" size={20} />
          <span>Buzz</span>
          <b>{signed(result.buzz)}</b>
        </li>
      </ul>
      <p className="ad-rewards__purse">
        Your purse now holds <b data-testid="purse-coins">{coinsNow}</b> coins.
      </p>
      {result.latePenalty > 0 ? (
        <p className="ad-rewards__late">
          The show ran late, so the panels took {result.latePenalty} points off the overall score.
        </p>
      ) : null}
    </section>
  );
}
