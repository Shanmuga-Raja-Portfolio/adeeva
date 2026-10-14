import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { useRovingRadio } from "../../../../../ui/kit/useRovingRadio";
import type { PathId } from "../../../content/path";
import { NAME_CARDS } from "../../../content/nameCard";
import { choosePathIssues, pathById, pathStartCost, type GameState } from "../../../core";
import { nameCardTitle } from "../path/restaurantName";
import "../path/pathDialogs.css";

export interface ChoosePathDialogProps {
  readonly state: GameState;
  readonly path: PathId | null;
  readonly onClose: () => void;
  readonly onConfirm: (path: PathId, nameCard: string | null) => void;
}

function Body({ state, path, onClose, onConfirm }: ChoosePathDialogProps & { readonly path: PathId }) {
  const [card, setCard] = useState<string | null>(null);
  const roving = useRovingRadio(
    NAME_CARDS.map((entry) => ({ value: entry.id })),
    card,
    setCard,
  );
  const def = pathById(path);
  const nameCard = path === "restaurant" ? card : null;
  const issue = choosePathIssues(state, path, nameCard)[0];
  return (
    <Dialog
      open
      title={`Choose ${def.name.toLowerCase()}?`}
      onClose={onClose}
      className="ad-dialog--wide ck-choose-dialog"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Not yet
          </Button>
          <Button
            icon="star"
            onClick={() => onConfirm(path, nameCard)}
            disabledReason={issue}
            showReason
            data-testid="confirm-path"
          >
            Open the door ({pathStartCost(state, path)} coins)
          </Button>
        </>
      }
    >
      <p>This is your path for this save. Your other save slots can try the other doors any time.</p>
      {path === "restaurant" ? (
        <>
          <p className="ck-muted">Pick the name card that goes over the door on Quayside Lane.</p>
          <div className="ck-name-cards" role="radiogroup" aria-label="Restaurant name">
            {NAME_CARDS.map((entry, index) => (
              <button
                key={entry.id}
                ref={roving.buttonRef(index)}
                type="button"
                role="radio"
                aria-checked={card === entry.id}
                tabIndex={roving.tabIndex(index)}
                onKeyDown={(event) => roving.handleKey(event, index)}
                className={card === entry.id ? "ck-name-card ck-name-card--on" : "ck-name-card"}
                onClick={() => setCard(entry.id)}
                data-testid={`name-${entry.id}`}
              >
                {nameCardTitle(entry.id, state.profile.name)}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </Dialog>
  );
}

export function ChoosePathDialog(props: ChoosePathDialogProps) {
  return props.path === null ? null : <Body {...props} path={props.path} />;
}
