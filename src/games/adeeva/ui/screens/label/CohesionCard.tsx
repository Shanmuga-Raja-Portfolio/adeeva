import type { ColourId } from "../../../../../engine/palette";
import type { ShowThemeDef } from "../../../content/showTheme";
import { colourById, finishedLooks, paletteCohesion, type LabelSeason } from "../../../core";
import { Meter } from "../../../../../ui/kit/Meter";

export interface CohesionCardProps {
  season: LabelSeason;
  theme: ShowThemeDef;
}

function cohesionWords(value: number): string {
  if (value >= 0.6) return "One clear story. The looks feel like sisters.";
  if (value >= 0.35) return "A lovely family resemblance, with room to tie them closer.";
  if (value > 0) return "The looks are speaking different languages for now.";
  return "No shared colours yet. Repeat a shade or two to link the looks.";
}

export function CohesionCard({ season, theme }: CohesionCardProps) {
  const looks = finishedLooks(season);
  const palettes = looks.map((look) => look.snapshot.colours);
  const ready = looks.length >= 2;
  const cohesion = ready ? Math.round(100 * paletteCohesion(palettes)) : 0;
  const counts = new Map<ColourId, number>();
  for (const palette of palettes) {
    for (const colour of palette) counts.set(colour, (counts.get(colour) ?? 0) + 1);
  }
  const used = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const onTheme = used.filter(([colour]) => theme.palette.includes(colour)).length;
  return (
    <section className="ad-board-note ad-cohesion" aria-labelledby="cohesion-title" data-testid="cohesion">
      <span className="ad-board-note__pin" aria-hidden="true" />
      <h2 id="cohesion-title" className="ad-board-note__title">
        Collection cohesion
      </h2>
      {ready ? (
        <>
          <Meter label="Shared palette" value={cohesion} tone="gold" valueText={`${cohesion}%`} />
          <p className="ad-cohesion__words">{cohesionWords(cohesion / 100)}</p>
        </>
      ) : (
        <p className="ad-cohesion__words">Finish two looks to see how they sit together on the rail.</p>
      )}
      {used.length > 0 ? (
        <ul className="ad-cohesion__swatches" aria-label="Colours used across the collection">
          {used.map(([colour, count]) => (
            <li
              key={colour}
              className={
                count > 1 ? "ad-cohesion__swatch ad-cohesion__swatch--shared" : "ad-cohesion__swatch"
              }
            >
              <span style={{ background: colourById(colour).hex }} aria-hidden="true" />
              {colourById(colour).name}
              {count > 1 ? <b>×{count}</b> : null}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="ad-cohesion__explain">
        Cohesion compares every pair of looks. The more colours they share, the more the show reads as one
        story, and critics give it a fifth of their score.
        {used.length > 0
          ? ` ${onTheme} of your ${used.length} ${used.length === 1 ? "colour sits" : "colours sit"} in the season palette.`
          : ""}
      </p>
    </section>
  );
}
