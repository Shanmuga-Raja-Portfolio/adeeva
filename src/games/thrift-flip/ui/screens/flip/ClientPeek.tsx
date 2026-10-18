import { useState, type KeyboardEvent } from "react";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { checklist, personById, type FlipRun, type GameState } from "../../../core";
import { BriefChecklist } from "./BriefChecklist";
import { ClientCorner } from "./ClientCorner";

export interface ClientPeekProps {
  readonly state: GameState;
  readonly run: FlipRun;
}

export function ClientPeek({ state, run }: ClientPeekProps) {
  const [open, setOpen] = useState(false);
  const brief = run.brief;
  const client = brief === null ? undefined : personById(brief.clientId);
  const look = client?.look ?? state.profile.look;
  const name = client?.name ?? "Your own piece";
  const items = brief === null ? [] : checklist(state);
  const met = items.filter((item) => item.status === "met").length;
  const unmet = items.some((item) => item.status === "unmet");
  const close = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") setOpen(false);
  };
  return (
    <div className={open ? "tf-peek tf-peek--open" : "tf-peek"} onKeyDown={close}>
      <button
        type="button"
        className="tf-peek__button"
        aria-expanded={open}
        aria-controls="tf-peek-panel"
        onClick={() => setOpen(!open)}
      >
        <Avatar look={look} size={38} frameColour="#fde4cf" title={name} />
        <span className="tf-peek__text">
          <strong>{name}</strong>
          <small className={unmet ? "tf-peek__count tf-peek__count--warn" : "tf-peek__count"}>
            {brief === null ? "Your list" : `${met}/${items.length} on track`}
          </small>
        </span>
        <span className="tf-peek__chev" aria-hidden="true">
          {open ? "▴" : "▾"}
        </span>
      </button>
      <div className="tf-peek__panel" id="tf-peek-panel" hidden={!open}>
        <ClientCorner state={state} run={run} />
        <BriefChecklist state={state} run={run} />
      </div>
    </div>
  );
}
