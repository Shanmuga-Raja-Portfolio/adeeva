import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import type { FlipRun } from "../../../core";

export interface SetAsideDialogProps {
  readonly run: FlipRun | null;
  readonly open: boolean;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

export function SetAsideDialog({ run, open, onConfirm, onClose }: SetAsideDialogProps) {
  return (
    <Dialog
      open={open && run !== null}
      title="Set aside this flip?"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" autoFocus onClick={onClose}>
            Keep working
          </Button>
          <Button onClick={onConfirm} data-testid="confirm-set-aside">
            Set it aside
          </Button>
        </>
      }
    >
      <p>Your bench will be cleared so you can start something new.</p>
      <p className="ad-muted">
        {run?.cutDone === true
          ? "The cut pieces can't be put back together, and the hours you spent are not given back."
          : "Your finds go back to the stockroom. The hours you spent are not given back."}{" "}
        {run?.purpose.kind === "gig" ? "The order stays open, so you can start again before it is due." : ""}
      </p>
    </Dialog>
  );
}
