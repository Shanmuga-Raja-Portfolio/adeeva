import { Card } from "../../../../../ui/kit/Card";
import { StarRating } from "../../../../../ui/kit/StarRating";
import { clientById, type GameState } from "../../../core";

export interface ResultsLogProps {
  readonly state: GameState;
}

export function ResultsLog({ state }: ResultsLogProps) {
  const recent = [...state.log].reverse().slice(0, 4);
  if (recent.length === 0) return null;
  return (
    <Card
      title="Recent flips"
      eyebrow={`${state.flipsFinished} rescued so far`}
      className="tf-hub-card tf-log"
    >
      <ul className="tf-log__list">
        {recent.map((entry) => (
          <li key={entry.runId}>
            <span>
              <strong>
                {entry.clientId === null ? "For the rack" : (clientById(entry.clientId)?.name ?? "A regular")}
              </strong>
              <small>Day {entry.day}</small>
            </span>
            <StarRating stars={entry.evaluation.stars} />
            <span className="tf-log__coins">
              {entry.reward === null ? "On the rack" : `+${entry.reward.coins}`}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
