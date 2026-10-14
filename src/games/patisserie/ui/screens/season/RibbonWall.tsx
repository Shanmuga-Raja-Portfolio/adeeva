import { FAIR_THEMES } from "../../../content/fairTheme";
import { SEASONS } from "../../../content/season";
import { ribbonById, type FairState } from "../../../core";
import { Rosette } from "../../art/Rosette";

export interface RibbonWallProps {
  readonly fair: FairState;
}

export function RibbonWall({ fair }: RibbonWallProps) {
  return (
    <section className="pa-ribbon-wall" aria-labelledby="pa-ribbon-wall-title" data-testid="ribbon-wall">
      <h3 id="pa-ribbon-wall-title">The Ribbon Wall</h3>
      <div className="pa-ribbon-wall__seasons">
        {SEASONS.map((season) => (
          <div key={season.id} className="pa-ribbon-wall__season">
            <span className="ad-eyebrow">{season.name}</span>
            <ul>
              {FAIR_THEMES.filter((theme) => theme.season === season.id).map((theme) => {
                const ribbon = fair.ribbonWall[theme.id] ?? null;
                return (
                  <li key={theme.id} className="pa-ribbon-wall__hook">
                    <Rosette
                      ribbon={ribbon}
                      size={48}
                      title={ribbon === null ? undefined : `${ribbonById(ribbon).name} for ${theme.name}`}
                    />
                    <span>{theme.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
