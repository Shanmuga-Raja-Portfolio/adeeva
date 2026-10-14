import { letterById, type TvState } from "../../../core";

export function LettersWall({ tv }: { readonly tv: TvState }) {
  const letters = [...tv.letters].reverse().flatMap((id) => {
    const letter = letterById(id);
    return letter === undefined ? [] : [letter];
  });
  return (
    <section className="ck-panel ck-letters" aria-labelledby="ck-letters-title" data-testid="letters-wall">
      <header className="ck-panel__header">
        <h2 id="ck-letters-title">Letters from young cooks</h2>
        <span className="ck-muted">One arrives after every 4-star segment</span>
      </header>
      {letters.length === 0 ? (
        <p className="ck-muted">The post box is waiting. Teach a kind, clear segment!</p>
      ) : (
        <ul className="ck-letters__list">
          {letters.map((letter, index) => (
            <li
              key={letter.id}
              className="ck-letter"
              style={{ ["--ck-tilt" as string]: `${(index % 3) - 1}deg` }}
            >
              <p className="ck-letter__text">“{letter.text}”</p>
              <p className="ck-letter__from">{letter.from}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
