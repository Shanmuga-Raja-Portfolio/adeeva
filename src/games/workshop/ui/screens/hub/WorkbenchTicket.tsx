import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";

export interface WorkbenchTicketProps {
  readonly title: string | null;
  readonly quietWhenClear: boolean;
  readonly setAsideReason: string | undefined;
  readonly onOpen: () => void;
  readonly onSetAside: () => void;
}

export function WorkbenchTicket({
  title,
  quietWhenClear,
  setAsideReason,
  onOpen,
  onSetAside,
}: WorkbenchTicketProps) {
  if (title === null && quietWhenClear) return null;
  if (title === null) {
    return (
      <div className="ww-ticket ww-ticket--clear">
        <span className="ww-ticket__clip" aria-hidden="true" />
        <span className="ad-eyebrow">On the workbench</span>
        <p className="ww-ticket__empty">
          <Icon name="sparkle" size={16} /> All clear. Accept a note from the door to start a piece.
        </p>
      </div>
    );
  }
  return (
    <div className="ww-ticket">
      <span className="ww-ticket__clip" aria-hidden="true" />
      <span className="ad-eyebrow">On the workbench</span>
      <h2 className="ww-ticket__title">{title}</h2>
      <Button onClick={onOpen} icon="sparkle">
        Back to the workbench
      </Button>
      <Button variant="ghost" size="sm" onClick={onSetAside} disabledReason={setAsideReason}>
        Set aside
      </Button>
    </div>
  );
}
