import { canChooseRunway, type GameState, type LabelSeason } from "../../../core";
import { Button } from "../../kit/Button";

export interface RunwayCalloutProps {
  state: GameState;
  season: LabelSeason;
  onPlan: () => void;
  onResults: () => void;
  onReplay: () => void;
}

export function RunwayCallout({ state, season, onPlan, onResults, onReplay }: RunwayCalloutProps) {
  const check = canChooseRunway(state);
  const done = season.looks.filter((look) => look !== null).length;
  if (season.result !== null) {
    return (
      <section className="ad-board-note ad-runway-callout ad-runway-callout--done">
        <span className="ad-board-note__pin" aria-hidden="true" />
        <h2 className="ad-board-note__title">The show is over</h2>
        <p>The reviews are in, and the orders are on their way.</p>
        <div className="ad-runway-callout__actions">
          <Button icon="star" block onClick={onResults}>
            See the reviews
          </Button>
          <Button variant="secondary" block onClick={onReplay}>
            Watch the show again
          </Button>
        </div>
      </section>
    );
  }
  return (
    <section
      className={
        check.ok
          ? "ad-board-note ad-runway-callout ad-runway-callout--ready"
          : "ad-board-note ad-runway-callout"
      }
    >
      <span className="ad-board-note__pin" aria-hidden="true" />
      <h2 className="ad-board-note__title">{check.ok ? "Ready for the runway" : "The runway awaits"}</h2>
      <ol
        className="ad-runway-callout__steps"
        aria-label={`${done} of ${season.looks.length} looks finished`}
      >
        {season.looks.map((look, index) => (
          <li key={index} className={look !== null ? "is-done" : ""}>
            {look !== null ? "✓" : index + 1}
          </li>
        ))}
      </ol>
      <p>
        {check.ok
          ? "Three looks, pressed and steamed. Set the walk order, the music and the lights."
          : `${done} of ${season.looks.length} looks finished. The runway planner opens when all three are ready.`}
      </p>
      <Button icon="sparkle" size="lg" block disabledReason={check.reasons[0]} showReason onClick={onPlan}>
        Plan the runway
      </Button>
    </section>
  );
}
