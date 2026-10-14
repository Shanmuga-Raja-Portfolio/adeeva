import { jewelColourById } from "../../../content/jewelColour";
import { themeById, visibleNextTrends, type GameState } from "../../../core";

interface ChalkBoardProps {
  readonly state: GameState;
}

export function ChalkBoard({ state }: ChalkBoardProps) {
  const next = visibleNextTrends(state);
  const theme = themeById(state.marketTheme);
  return (
    <section className="jb-chalk" aria-labelledby="jb-chalk-title" data-testid="trends-board">
      <div className="jb-chalk__board">
        <h2 id="jb-chalk-title" className="jb-chalk__title">
          Arcade chalkboard
        </h2>
        <p className="jb-chalk__line">
          Shoppers love: <strong>{state.trends.current.join(", ")}</strong>.
        </p>
        {next !== null ? (
          <p className="jb-chalk__line jb-chalk__line--next">
            Next week: <strong>{next.join(", ")}</strong>.
          </p>
        ) : null}
      </div>
      <div className="jb-theme" style={{ borderColor: jewelColourById(theme.palette[0] ?? "gold").hex }}>
        <span className="ad-eyebrow">This week's Market Day</span>
        <h3 className="jb-theme__name">{theme.name}</h3>
        <p className="jb-muted jb-theme__blurb">{theme.blurb}</p>
        <div
          className="jb-theme__palette"
          aria-label={`Colours: ${theme.palette.map((id) => jewelColourById(id).name).join(", ")}`}
        >
          {theme.palette.map((colour) => (
            <span
              key={colour}
              className="jb-theme__swatch"
              style={{ background: jewelColourById(colour).hex }}
            />
          ))}
          <span className="jb-theme__tags">{theme.tags.join(" · ")}</span>
        </div>
      </div>
    </section>
  );
}
