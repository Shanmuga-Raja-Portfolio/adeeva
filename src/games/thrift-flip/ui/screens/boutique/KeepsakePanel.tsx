import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { ROSETTES } from "../../../content/rosette";
import { seasonById, type GameState } from "../../../core";
import { RosetteArt } from "../../art/RosetteArt";

export interface KeepsakePanelProps {
  readonly state: GameState;
}

export function KeepsakePanel({ state }: KeepsakePanelProps) {
  const boutique = state.boutique;
  if (boutique === null) return null;
  return (
    <Card
      title="Rosette Wall"
      eyebrow="Things saved and shows held"
      className="tf-hub-card tf-keepsakes"
      data-testid="keepsakes"
    >
      <p className="tf-keepsakes__saved" aria-label={`${state.keptInUse} things saved`}>
        <span className="tf-keepsakes__leaf" aria-hidden="true">
          <Icon name="heart" size={20} />
        </span>
        <strong data-testid="kept-in-use">{state.keptInUse}</strong>
        <span>things saved and still in use</span>
      </p>
      {boutique.rosettes.length === 0 ? (
        <p className="ad-muted">Your first rosette arrives with this season&apos;s Showcase.</p>
      ) : (
        <ul className="tf-keepsakes__wall">
          {boutique.rosettes.map((entry) => {
            const name = ROSETTES.find((rosette) => rosette.id === entry.rosette)?.name ?? "Rosette";
            return (
              <li key={entry.season}>
                <RosetteArt
                  rosette={entry.rosette}
                  size={60}
                  title={`${name} for ${seasonById(entry.themeId).name}`}
                />
                <span>
                  {name}
                  <small>
                    Season {entry.season} · {entry.overall}
                  </small>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
