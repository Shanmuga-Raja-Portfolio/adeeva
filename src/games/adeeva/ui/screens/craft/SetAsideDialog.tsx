import type { DressRun } from "../../../core";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { briefOwner } from "./briefOwner";

export interface SetAsideDialogProps {
  readonly run: DressRun | null;
  readonly open: boolean;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

function dressName(run: DressRun): string {
  if (run.purpose.kind === "look") return `look ${run.purpose.lookIndex + 1}`;
  const { client } = briefOwner(run.brief);
  return client !== undefined ? `${client.name}'s dress` : "this dress";
}

export function SetAsideDialog({ run, open, onConfirm, onClose }: SetAsideDialogProps) {
  return (
    <Dialog
      open={open && run !== null}
      title="Set aside this dress?"
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
      {run !== null ? (
        <>
          <p>
            You will clear the work table of <strong>{dressName(run)}</strong> so you can start something new.
          </p>
          <p className="ad-muted">
            Any fabric you have already cut stays used, and the hours you spent are not given back.{" "}
            {run.purpose.kind === "look"
              ? "The look slot opens again, so you can design a fresh look for the collection."
              : "The gig stays in your list, so you can start a fresh dress for it before the deadline."}
          </p>
        </>
      ) : null}
    </Dialog>
  );
}
