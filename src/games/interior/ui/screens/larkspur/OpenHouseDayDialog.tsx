import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import type { OpenHouseAlert } from "../../../core";

export interface OpenHouseDayDialogProps {
  readonly alert: OpenHouseAlert | null;
  readonly relaxed: boolean;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

export function OpenHouseDayDialog({ alert, relaxed, onConfirm, onClose }: OpenHouseDayDialogProps) {
  return (
    <Dialog
      open={alert !== null}
      title={alert === "late" ? "Let Ms. Achebe open the doors?" : "Today is Open House day!"}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" autoFocus onClick={onClose}>
            Stay today
          </Button>
          <Button onClick={onConfirm} data-testid="confirm-end-day">
            End the day
          </Button>
        </>
      }
    >
      {alert === "late" ? (
        <p>If the day ends now, Ms. Achebe opens the doors for you tonight with her own plan.</p>
      ) : (
        <p>
          You can still open the doors tomorrow
          {relaxed ? "." : ", but it will be a day late and the neighbours will give 10 points less."}
        </p>
      )}
    </Dialog>
  );
}
