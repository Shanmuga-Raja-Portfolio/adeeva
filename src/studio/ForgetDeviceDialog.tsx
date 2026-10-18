import { useId, useState } from "react";
import { Button } from "../ui/kit/Button";
import { Dialog } from "../ui/kit/Dialog";

export const FORGET_WORD = "delete";

export interface ForgetDeviceDialogProps {
  readonly open: boolean;
  readonly onKeep: () => void;
  readonly onForget: () => void;
}

export function confirmsForget(typed: string): boolean {
  return typed.trim().toLowerCase() === FORGET_WORD;
}

export function ForgetDeviceDialog({ open, onKeep, onForget }: ForgetDeviceDialogProps) {
  const [typed, setTyped] = useState("");
  const fieldId = useId();
  const keep = () => {
    setTyped("");
    onKeep();
  };
  return (
    <Dialog
      open={open}
      title="Delete everything on this device?"
      onClose={keep}
      footer={
        <>
          <Button autoFocus variant="primary" onClick={keep}>
            Keep everything
          </Button>
          <Button variant="secondary" disabled={!confirmsForget(typed)} onClick={onForget}>
            Delete everything
          </Button>
        </>
      }
    >
      <p>
        Every save, setting, perk and playtime record for all seven games will be removed from this device.
        This can&apos;t be undone. The game itself stays, so it still opens without the internet.
      </p>
      <p className="st-muted">This is a grown-up job. To go ahead, type the word {FORGET_WORD} below.</p>
      <label className="st-about__confirm" htmlFor={fieldId}>
        <span>Type {FORGET_WORD} to confirm</span>
        <input
          id={fieldId}
          value={typed}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          onChange={(event) => setTyped(event.target.value)}
        />
      </label>
    </Dialog>
  );
}
