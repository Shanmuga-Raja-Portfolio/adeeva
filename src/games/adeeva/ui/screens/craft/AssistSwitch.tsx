export interface AssistSwitchProps {
  readonly label: string;
  readonly detail: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}

export function AssistSwitch({ label, detail, checked, onChange }: AssistSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={checked ? "ad-assist-switch ad-assist-switch--on" : "ad-assist-switch"}
      onClick={() => onChange(!checked)}
    >
      <span className="ad-assist-switch__track" aria-hidden="true">
        <span className="ad-assist-switch__thumb" />
      </span>
      <span className="ad-assist-switch__text">
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
    </button>
  );
}
