import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";

export interface LeaveDraftDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly detail: string;
  readonly stayLabel: string;
  readonly onStay: () => void;
  readonly onLeave: () => void;
}

export function LeaveDraftDialog({ open, title, detail, stayLabel, onStay, onLeave }: LeaveDraftDialogProps) {
  return (
    <Dialog
      open={open}
      title={title}
      onClose={onStay}
      footer={
        <>
          <Button variant="ghost" onClick={onLeave} data-testid="confirm-leave">
            Leave
          </Button>
          <Button autoFocus onClick={onStay} data-testid="keep-draft">
            {stayLabel}
          </Button>
        </>
      }
    >
      <p>{detail}</p>
    </Dialog>
  );
}
