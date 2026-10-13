import { TagPill } from "../../../../../ui/kit/TagPill";
import type { GameState } from "../../../core";

export function TrendsBoard({ state }: { readonly state: GameState }) {
  const next = state.profile.trait === "trendsetter" ? state.trends.next : null;
  return (
    <section className="pa-trends" aria-labelledby="pa-trends-title">
      <h3 id="pa-trends-title" className="pa-trends__title">
        Town favourites
      </h3>
      <p className="pa-trends__chalk">
        {state.trends.current.map((tag) => (
          <TagPill key={tag} tone="hot">
            {tag}
          </TagPill>
        ))}
      </p>
      {next !== null ? (
        <p className="pa-trends__soon">
          <span className="pa-trends__ribbon">Soon</span>
          {next.map((tag) => (
            <TagPill key={tag} tone="next">
              {tag}
            </TagPill>
          ))}
        </p>
      ) : null}
      <p className="pa-trends__note">Bakes that match pay a little extra and bring more buzz.</p>
    </section>
  );
}
