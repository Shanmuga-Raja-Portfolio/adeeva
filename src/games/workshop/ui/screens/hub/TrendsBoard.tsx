import type { GameState } from "../../../core";

export function TrendsBoard({ state }: { readonly state: GameState }) {
  const next = state.profile.trait === "trendsetter" ? state.trends.next : null;
  return (
    <section className="ww-trends ww-chalkboard" aria-labelledby="ww-trends-title">
      <h3 id="ww-trends-title" className="ww-trends__title">
        This week
      </h3>
      <p className="ww-trends__chalk" data-testid="trends">
        Folks love: <strong>{state.trends.current.join(", ")}</strong>.
      </p>
      {next !== null ? (
        <p className="ww-trends__soon">
          <span className="ww-trends__ribbon">Next week</span> {next.join(", ")}
        </p>
      ) : null}
      <p className="ww-trends__note">Pieces that match pay a little extra and bring more buzz.</p>
      <svg className="ww-trends__chalk-stick" viewBox="0 0 60 14" aria-hidden="true" focusable="false">
        <rect x={2} y={3} width={40} height={8} rx={3} fill="#f6efe0" />
        <rect x={40} y={3} width={16} height={8} rx={3} fill="#f2c4c9" />
      </svg>
    </section>
  );
}
