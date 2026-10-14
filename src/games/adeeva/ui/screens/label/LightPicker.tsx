import type { ReactNode } from "react";
import { RUNWAY_LIGHTS, type RunwayLightId } from "../../../content/runwayLight";
import { RunwayStage } from "../../art/RunwayStage";
import { LIGHT_COPY } from "./moodCopy";

export interface LightPickerProps {
  value: RunwayLightId | null;
  onChange: (light: RunwayLightId) => void;
  renderPreview?: ((light: RunwayLightId) => ReactNode) | undefined;
  copy?: Readonly<Record<RunwayLightId, string>> | undefined;
}

export function LightPicker({ value, onChange, renderPreview, copy = LIGHT_COPY }: LightPickerProps) {
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
            {renderPreview === undefined ? (
              <RunwayStage light={light.id} progress={0} className="ad-rw-choice__stage" title={light.name} />
            ) : (
              renderPreview(light.id)
            )}
            <span className="ad-rw-choice__name">{light.name}</span>
            <span className="ad-rw-choice__copy">{copy[light.id]}</span>
          </button>
        );
      })}
    </div>
  );
}
