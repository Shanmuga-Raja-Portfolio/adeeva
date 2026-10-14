import { useState, type ReactNode } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import type { Dish, DishId } from "../../../content/dish";
import type { GameState } from "../../../core";
import { DishPicker } from "./DishPicker";
import "./dialogs.css";

export interface DishChoiceDialogProps {
  readonly state: GameState;
  readonly open: boolean;
  readonly title: string;
  readonly lead: ReactNode;
  readonly max: number;
  readonly initial: readonly DishId[];
  readonly confirmLabel: string;
  readonly allowed?: ((dish: Dish) => boolean) | undefined;
  readonly issue: (selected: readonly DishId[]) => string | null;
  readonly onConfirm: (selected: readonly DishId[]) => void;
  readonly onClose: () => void;
}

function DialogBody(props: DishChoiceDialogProps) {
  const [selected, setSelected] = useState<readonly DishId[]>(props.initial);
  const issue = props.issue(selected);
  return (
    <Dialog
      open
      title={props.title}
      onClose={props.onClose}
      className="ad-dialog--wide ck-dish-dialog"
      footer={
        <>
          <span className="ck-dish-dialog__count">
            {selected.length} of {props.max} picked
          </span>
          <Button variant="ghost" onClick={props.onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => props.onConfirm(selected)}
            disabledReason={issue ?? undefined}
            data-testid="confirm-dishes"
          >
            {props.confirmLabel}
          </Button>
        </>
      }
    >
      <div className="ck-dish-dialog__lead">{props.lead}</div>
      <DishPicker
        state={props.state}
        selected={selected}
        max={props.max}
        allowed={props.allowed}
        onChange={setSelected}
      />
    </Dialog>
  );
}

export function DishChoiceDialog(props: DishChoiceDialogProps) {
  return props.open ? <DialogBody {...props} /> : null;
}
