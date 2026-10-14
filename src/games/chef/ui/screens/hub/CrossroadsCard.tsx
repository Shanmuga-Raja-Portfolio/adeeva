import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { crossroadsGoals, type GameState } from "../../../core";

export interface CrossroadsCardProps {
  readonly state: GameState;
  readonly onVisit: () => void;
}

export function CrossroadsCard({ state, onVisit }: CrossroadsCardProps) {
  const goals = crossroadsGoals(state);
  return (
    <article className="ck-test-card ck-crossroads-card" data-testid="crossroads-card">
      <span className="ad-eyebrow">After head chef</span>
      <h3>The Crossroads</h3>
      <p className="ck-muted">
        Three doors: a restaurant of your own, a food truck, or a studio kitchen and a cookbook.
      </p>
      {goals.length === 0 ? (
        <>
          <p className="ck-test-card__ready">
            <Icon name="check" size={16} /> Hollis is holding the doors open for you.
          </p>
          <Button icon="star" onClick={onVisit} data-testid="visit-crossroads">
            Go to the Crossroads
          </Button>
        </>
      ) : (
        <ul className="ck-test-card__goals">
          {goals.map((goal) => (
            <li key={goal}>{goal}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
