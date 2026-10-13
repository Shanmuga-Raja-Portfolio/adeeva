import { useId } from "react";
import "./ToggleSwitch.css";

export interface ToggleSwitchProps {
  label: string;
  description?: string | undefined;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleSwitch({ label, description, checked, onChange }: ToggleSwitchProps) {
  const labelId = useId();
  const descriptionId = useId();
  return (
    <div className="ad-toggle">
      <span className="ad-toggle__text">
        <span id={labelId} className="ad-toggle__label">
          {label}
        </span>
        {description !== undefined ? (
          <span id={descriptionId} className="ad-toggle__description">
            {description}
          </span>
        ) : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={description !== undefined ? descriptionId : undefined}
        className="ad-toggle__switch"
        onClick={() => onChange(!checked)}
      >
        <span className="ad-toggle__knob" />
      </button>
    </div>
  );
}
