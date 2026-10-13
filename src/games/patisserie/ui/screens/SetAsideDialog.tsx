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
      title="Set aside this bake?"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" autoFocus onClick={onClose}>
            Keep baking
          </Button>
          <Button onClick={onConfirm} data-testid="confirm-set-aside">
            Set it aside
          </Button>
        </>
      }
    >
      <p>Your bench will be cleared so you can start something new.</p>
      <p className="pa-muted">
        Ingredients already in the bowl stay used, and the hours you spent are not given back. The order stays
        on your list, so you can start it again before it is due.
      </p>
    </Dialog>
  );
}
