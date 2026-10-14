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
      title="Set this piece aside?"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" autoFocus onClick={onClose}>
            Keep building
          </Button>
          <Button onClick={onConfirm} data-testid="confirm-set-aside">
            Set it aside
          </Button>
        </>
      }
    >
      <p>Your workbench will be cleared so you can start something new.</p>
      <p className="ww-muted">
        Boards you already sawed stay used, and the hours you spent are not given back. The job stays on your
        list, so you can start it again before it is due.
      </p>
    </Dialog>
  );
}
