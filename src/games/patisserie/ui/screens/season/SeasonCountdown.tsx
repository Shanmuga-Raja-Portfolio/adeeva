import { Icon, type IconName } from "../../../../../ui/kit/IconSet";

export interface SeasonCountdownProps {
  readonly label: string;
  readonly when: string;
  readonly icon: IconName;
  readonly tone: "sage" | "hot";
}

export function SeasonCountdown({ label, when, icon, tone }: SeasonCountdownProps) {
  return (
    <span className={`pa-countdown pa-countdown--${tone}`}>
      <span className="pa-countdown__badge" aria-hidden="true">
        <Icon name={icon} size={16} />
      </span>
      <span className="pa-countdown__text">
        <span className="pa-countdown__label">{label}</span>
        <strong>{when}</strong>
      </span>
    </span>
  );
}
