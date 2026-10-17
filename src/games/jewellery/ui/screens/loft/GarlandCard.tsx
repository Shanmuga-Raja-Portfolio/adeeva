import { Card } from "../../../../../ui/kit/Card";
import { AWARDS } from "../../../content/launchAward";
import { garlandGlows, type GameState } from "../../../core";
import { LanternGarland } from "../../art/LanternGarland";
import { garlandLights } from "./garlandLights";

export function GarlandCard({ state }: { readonly state: GameState }) {
  const launch = state.launch;
  if (launch === null) return null;
  const lights = garlandLights(state);
  const lit = lights.filter((light) => light.hex !== null).length;
  return (
    <Card
      title="Lantern Garland"
      eyebrow={`${lit} of ${lights.length} lit`}
      className="jb-hub-card"
      data-testid="garland-card"
    >
      <svg
        className="jb-garland-card__art"
        viewBox="0 0 400 120"
        role="img"
        aria-label={`Lantern Garland: ${lit} of ${lights.length} lanterns lit`}
      >
        <rect width={400} height={120} rx={14} fill="#2b2440" />
        <LanternGarland lights={lights} width={380} sag={30} size={30} x={10} y={20} />
      </svg>
      <ul className="jb-garland-card__key">
        {AWARDS.map((award) => (
          <li key={award.id}>
            <span className="jb-garland-card__dot" style={{ background: award.colour }} /> {award.name}
          </li>
        ))}
      </ul>
      <p className="jb-hint">
        {garlandGlows(launch.garland)
          ? "The whole loft window glows. What a garland!"
          : "Each theme's lantern lights in the colour of its best award."}
      </p>
    </Card>
  );
}
