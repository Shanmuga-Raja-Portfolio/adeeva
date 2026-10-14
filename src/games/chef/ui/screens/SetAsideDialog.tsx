import { Button } from "../../../../ui/kit/Button";
import { Dialog } from "../../../../ui/kit/Dialog";
import type { RunPurpose } from "../../core";

export interface SetAsideDialogProps {
  readonly open: boolean;
  readonly purpose: RunPurpose["kind"] | null;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

const TITLES = { test: "Stop today's test?", segment: "Stop the live segment?" } as const;
const CONFIRMS = { test: "Stop the test", segment: "Stop the segment" } as const;
const NOTES = {
  test: "The hours you spent are not given back, but you can try the test again tomorrow with no penalty.",
  segment:
    "The hours you spent are not given back, and this segment still counts as one of this week's two. There is no pay for it.",
} as const;

export function SetAsideDialog({ open, purpose, onConfirm, onClose }: SetAsideDialogProps) {
  const special = purpose === "test" || purpose === "segment" ? purpose : null;
  return (
    <Dialog
      open={open}
      title={special === null ? "Set this dish aside?" : TITLES[special]}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" autoFocus onClick={onClose}>
            Keep cooking
          </Button>
          <Button onClick={onConfirm} data-testid="confirm-set-aside">
            {special === null ? "Set it aside" : CONFIRMS[special]}
          </Button>
        </>
      }
    >
      <p>Your board will be cleared so you can start something new.</p>
      <p className="ck-muted">
        {special === null
          ? "The hours you spent are not given back. Orders stay on your list, so you can start the dish again before they are due."
          : NOTES[special]}
      </p>
    </Dialog>
  );
}
