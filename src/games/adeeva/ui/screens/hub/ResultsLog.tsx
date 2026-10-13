import { clientById, type GameState, type LogEntry } from "../../../core";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { StarRating } from "../../../../../ui/kit/StarRating";

export interface ResultsLogProps {
  state: GameState;
}

const SHOWN_RESULTS = 5;

function entryTitle(entry: LogEntry): string {
  if (entry.purpose.kind === "look") return `Collection look ${entry.purpose.lookIndex + 1}`;
  return (entry.clientId === null ? undefined : clientById(entry.clientId))?.name ?? "Client";
}

export function ResultsLog({ state }: ResultsLogProps) {
  const entries = state.log.slice(-SHOWN_RESULTS).reverse();
  return (
    <Card title="Recent work" eyebrow="Lookbook" className="ad-hub-card">
      {entries.length === 0 ? (
        <div className="ad-empty">
          <Icon name="hanger" size={28} />
          <p>Your lookbook is waiting for its first page. Finished dresses will appear here.</p>
        </div>
      ) : (
        <ul className="ad-results">
          {entries.map((entry) => (
            <li key={entry.runId} className="ad-result">
              <span className="ad-result__who">
                <strong>{entryTitle(entry)}</strong>
                <span>Day {entry.day}</span>
              </span>
              <StarRating stars={entry.evaluation.stars} />
              <span className="ad-result__coins">
                {entry.reward !== null ? (
                  <>
                    <Icon name="coin" size={14} /> +{entry.reward.coins}
                  </>
                ) : (
                  "Ready for the runway"
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
