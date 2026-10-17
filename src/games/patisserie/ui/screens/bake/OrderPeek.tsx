import { useEffect, useId, useRef, useState } from "react";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Icon } from "../../../../../ui/kit/IconSet";
import { checklist, type BakeRun, type GameState } from "../../../core";
import { BriefChecklist } from "./BriefChecklist";
import { orderFace } from "./orderFace";

export interface OrderPeekProps {
  readonly state: GameState;
  readonly run: BakeRun;
}

export function OrderPeek({ state, run }: OrderPeekProps) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const panelId = useId();
  useEffect(() => {
    if (!open) return undefined;
    const away = (event: PointerEvent) => {
      if (box.current !== null && !box.current.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  if (run.brief === null) return null;
  const items = checklist(state, run);
  const met = items.filter((item) => item.status === "met").length;
  const all = items.length > 0 && met === items.length;
  const face = orderFace(run);
  return (
    <div className="pa-order-peek" ref={box}>
      <button
        type="button"
        className={all ? "pa-order-peek__button pa-order-peek__button--all" : "pa-order-peek__button"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((shown) => !shown)}
        data-testid="order-peek"
      >
        {face.look !== undefined ? (
          <Avatar look={face.look} size={38} title={face.name} frameColour="#fde6cf" />
        ) : null}
        <span className="pa-order-peek__text">
          <span className="pa-order-peek__label">{face.fair ? "Fair card" : "Order card"}</span>
          <strong>{all ? "Every wish ticked!" : `${met} of ${items.length} wishes`}</strong>
        </span>
        <span className="pa-order-peek__icon" aria-hidden="true">
          {all ? <Icon name="sparkle" size={18} /> : <span className="pa-order-peek__chevron" />}
        </span>
      </button>
      {open ? (
        <div className="pa-order-peek__panel" id={panelId}>
          <BriefChecklist state={state} run={run} />
        </div>
      ) : null}
    </div>
  );
}
