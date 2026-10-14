import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";

export interface CloseSalonDialogProps {
  readonly open: boolean;
  readonly sunset: boolean;
  readonly waiting: number;
  readonly coins: number;
  readonly onClose: () => void;
  readonly onKeep: () => void;
}

export function CloseSalonDialog({ open, sunset, waiting, coins, onClose, onKeep }: CloseSalonDialogProps) {
  const tables = waiting === 1 ? "table is" : "tables are";
  if (sunset)
    return (
      <Dialog
        open={open}
        title="The afternoon is over!"
        onClose={onClose}
        closeLabel="Close the salon"
        footer={
          <Button autoFocus onClick={onClose} data-testid="sunset-close-salon">
            Close the salon
          </Button>
        }
      >
        <p>{coins > 0 ? `Your guests left ${coins} coins today.` : "No tables were served this time."}</p>
        <p className="pa-muted">
          {waiting > 0
            ? `${waiting} ${tables} still waiting. They enjoyed the garden view, and their treats go to the counter.`
            : "Every table was served. What a lovely afternoon!"}
        </p>
      </Dialog>
    );
  return (
    <Dialog
      open={open}
      title={`Close with ${waiting} ${waiting === 1 ? "table" : "tables"} still waiting?`}
      onClose={onKeep}
      closeLabel="Keep serving"
      footer={
        <>
          <Button variant="ghost" autoFocus onClick={onKeep} data-testid="keep-serving">
            Keep serving
          </Button>
          <Button onClick={onClose} data-testid="confirm-close-salon">
            Close the salon
          </Button>
        </>
      }
    >
      <p>Closing ends Salon Day for this season. Unserved tables will not come back today.</p>
      <p className="pa-muted">Leftover treats go to the counter, and Salon Day comes again next season.</p>
    </Dialog>
  );
}
