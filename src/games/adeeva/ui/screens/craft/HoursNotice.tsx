import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";

export interface HoursNoticeProps {
  readonly message: string;
  readonly onExit: () => void;
}

export function HoursNotice({ message, onExit }: HoursNoticeProps) {
  return (
    <div className="ad-hours-notice" role="status">
      <span className="ad-hours-notice__icon" aria-hidden="true">
        <Icon name="clock" size={22} />
      </span>
      <div className="ad-hours-notice__text">
        <strong>Out of hours for today</strong>
        <span>{message} Your dress waits right here while you rest.</span>
      </div>
      <Button variant="secondary" onClick={onExit}>
        Back to studio to End Day
      </Button>
    </div>
  );
}
