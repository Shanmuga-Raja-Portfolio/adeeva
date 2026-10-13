import { RUNWAY_LIGHTS, type RunwayLightId } from "../../../content/runwayLight";
import { RunwayStage } from "../../art/RunwayStage";
import { LIGHT_COPY } from "./moodCopy";

export interface LightPickerProps {
  value: RunwayLightId | null;
  onChange: (light: RunwayLightId) => void;
}

export function LightPicker({ value, onChange }: LightPickerProps) {
  return (
    <div className="ad-rw-choice-grid ad-rw-choice-grid--lights" role="radiogroup" aria-label="Lighting">
      {RUNWAY_LIGHTS.map((light) => {
        const checked = value === light.id;
        return (
          <button
            key={light.id}
            type="button"
            role="radio"
            aria-checked={checked}
            className={
              checked ? "ad-rw-choice ad-rw-choice--light is-checked" : "ad-rw-choice ad-rw-choice--light"
            }
            onClick={() => onChange(light.id)}
          >
            <RunwayStage light={light.id} progress={0} className="ad-rw-choice__stage" title={light.name} />
            <span className="ad-rw-choice__name">{light.name}</span>
            <span className="ad-rw-choice__copy">{LIGHT_COPY[light.id]}</span>
          </button>
        );
      })}
    </div>
  );
}
