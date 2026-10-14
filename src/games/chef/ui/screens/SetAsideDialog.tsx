import { Button } from "../../../../ui/kit/Button";
import { Dialog } from "../../../../ui/kit/Dialog";

export interface SetAsideDialogProps {
  readonly open: boolean;
  readonly test: boolean;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

export function SetAsideDialog({ open, test, onConfirm, onClose }: SetAsideDialogProps) {
  return (
    <Dialog
      open={open}
      title={test ? "Stop today's test?" : "Set this dish aside?"}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" autoFocus onClick={onClose}>
            Keep cooking
          </Button>
          <Button onClick={onConfirm} data-testid="confirm-set-aside">
            {test ? "Stop the test" : "Set it aside"}
          </Button>
        </>
      }
    >
      <p>Your board will be cleared so you can start something new.</p>
      <p className="ck-muted">
        {test
          ? "The hours you spent are not given back, but you can try the test again tomorrow with no penalty."
          : "The hours you spent are not given back. Orders stay on your list, so you can start the dish again before they are due."}
      </p>
    </Dialog>
  );
}
