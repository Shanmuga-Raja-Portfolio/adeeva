import { Card } from "../../../../../ui/kit/Card";
import { FAIR_THEMES } from "../../../content/fairTheme";
import { rosetteById, type GameState } from "../../../core";
import { RosetteArt } from "../../art/RosetteArt";

export function RosetteRailCard({ state }: { readonly state: GameState }) {
  const fair = state.fair;
  if (state.career !== "showroom" || fair === null) return null;
  return (
    <Card
      title="The Rosette Rail"
      eyebrow="One hook for every theme"
      className="ww-hub-card"
      data-testid="rosette-rail"
    >
      <ul className="ww-rail-hooks">
        {FAIR_THEMES.map((theme) => {
          const rosette = fair.rosetteRail[theme.id];
          return (
            <li
              key={theme.id}
              className={
                rosette === undefined ? "ww-rail-hooks__hook" : "ww-rail-hooks__hook ww-rail-hooks__hook--won"
              }
            >
              <svg viewBox="-46 -46 92 130" aria-hidden="true">
                <path d="M0 -46 V-36" stroke="#8f5a26" strokeWidth={4} />
                {rosette === undefined ? (
                  <circle r={20} fill="none" stroke="#c9b394" strokeWidth={3} strokeDasharray="6 5" />
                ) : (
                  <RosetteArt rosetteId={rosette} />
                )}
              </svg>
              <span className="ww-rail-hooks__name">{theme.name}</span>
              <span className="ww-muted">
                {rosette === undefined ? "Waiting" : rosetteById(rosette).name}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
