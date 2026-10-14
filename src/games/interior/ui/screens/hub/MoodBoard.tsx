import { visibleNextTrends, type GameState } from "../../../core";

interface MoodBoardProps {
  readonly state: GameState;
}

const TAG_TINTS: Readonly<Record<string, string>> = {
  cosy: "#f2c4c9",
  calm: "#bcd3b8",
  bright: "#f6d77a",
  playful: "#f4a588",
  modern: "#9fd0ee",
  classic: "#e9dcc4",
  natural: "#c8d69a",
  bold: "#b9a7dc",
};

export function MoodBoard({ state }: MoodBoardProps) {
  const next = visibleNextTrends(state);
  return (
    <section className="is-mood" aria-labelledby="is-mood-title" data-testid="trends-board">
      <h2 id="is-mood-title" className="is-mood__title">
        Mood board
      </h2>
      <p className="is-mood__line">
        The street loves: <strong>{state.trends.current.join(", ")}</strong>.
      </p>
      <div className="is-mood__cards" aria-hidden="true">
        {state.trends.current.map((tag, index) => (
          <span
            key={tag}
            className="is-mood__chip"
            style={{ background: TAG_TINTS[tag] ?? "#fffaf2", rotate: `${index % 2 === 0 ? -4 : 3}deg` }}
          >
            {tag}
          </span>
        ))}
      </div>
      {next !== null ? (
        <p className="is-mood__line is-mood__line--next">
          Next week: <strong>{next.join(", ")}</strong>.
        </p>
      ) : null}
    </section>
  );
}
