import { Button } from "../../../../ui/kit/Button";
import { Dialog } from "../../../../ui/kit/Dialog";

export interface SetAsideDialogProps {
  readonly open: boolean;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

export function SetAsideDialog({ open, onConfirm, onClose }: SetAsideDialogProps) {
  return (
    <Dialog
      open={open}
      title="Set aside this room?"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" autoFocus onClick={onClose}>
            Keep designing
          </Button>
          <Button onClick={onConfirm} data-testid="confirm-set-aside">
            Set it aside
          </Button>
        </>
      }
    >
      <p>Your plan will be cleared so you can start again.</p>
      <p className="is-muted">
        Anything you bought stays on your shelf as leftovers, but paint already on the walls is used up and
        the hours you spent are not given back. The booking stays on your list until it is due.
      </p>
    </Dialog>
  );
}
