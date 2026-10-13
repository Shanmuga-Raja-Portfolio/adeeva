import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";

export interface SunsetDialogProps {
  readonly open: boolean;
  readonly boxes: number;
  readonly coins: number;
  readonly treatsLeft: number;
  readonly onClose: () => void;
}

export function SunsetDialog({ open, boxes, coins, treatsLeft, onClose }: SunsetDialogProps) {
  return (
    <Dialog
      open={open}
      title="The sun has set!"
      onClose={onClose}
      footer={
        <Button autoFocus onClick={onClose} data-testid="sunset-close">
          Close shop
        </Button>
      }
    >
      <p>
        You sold {boxes} {boxes === 1 ? "box" : "boxes"} today for {coins} coins.
      </p>
      <p className="pa-muted">
        {treatsLeft > 0
          ? `The ${treatsLeft} treats still on the counter, and any half-filled boxes, go to the neighbours.`
          : "Every treat found a home. What a day!"}
      </p>
    </Dialog>
  );
}
