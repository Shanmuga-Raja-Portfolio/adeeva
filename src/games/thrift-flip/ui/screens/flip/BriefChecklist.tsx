import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Icon } from "../../../../../ui/kit/IconSet";
import {
  checklist,
  clientById,
  flipQuality,
  leavesOf,
  type ChecklistStatus,
  type FlipRun,
  type GameState,
} from "../../../core";
import { LeafMeter } from "../../art/LeafMeter";

export interface BriefChecklistProps {
  readonly state: GameState;
  readonly run: FlipRun;
}

const STATUS_TEXT: Readonly<Record<ChecklistStatus, string>> = {
  met: "On track",
  unmet: "Needs attention",
  pending: "Not decided yet",
};

function Mark({ status }: { readonly status: ChecklistStatus }) {
  if (status === "met") return <Icon name="check" size={14} />;
  if (status === "unmet") return <span aria-hidden="true">!</span>;
  return <span aria-hidden="true">·</span>;
}

export function BriefChecklist({ state, run }: BriefChecklistProps) {
  if (run.brief === null) {
    const leaves = leavesOf(run, state.upgrades.includes("sharp-ripper")).leaves;
    return (
      <aside className="tf-checklist" aria-label="Your own piece">
        <header className="tf-checklist__head">
          <span className="ad-eyebrow">For your stall rack</span>
          <strong>Your own piece</strong>
          <span className="ad-muted">Judged by quality and leaves. Price it on Stall Day.</span>
        </header>
        <div className="tf-checklist__own">
          <span>Quality so far: {run.cutDone ? flipQuality(state, run).quality : "—"}</span>
          <LeafMeter leaves={run.cutDone ? leaves : 0} size={18} />
        </div>
      </aside>
    );
  }
  const items = checklist(state);
  const client = clientById(run.brief.clientId);
  const met = items.filter((item) => item.status === "met").length;
  return (
    <aside className="tf-checklist" aria-label="Order checklist">
      <header className="tf-checklist__head">
        {client !== undefined ? (
          <Avatar look={client.look} size={44} frameColour="#e2f4ea" title={client.name} />
        ) : null}
        <div>
          <span className="ad-eyebrow">Order checklist</span>
          <strong className="tf-checklist__who">{client?.name ?? "A regular"}</strong>
          <span className="tf-checklist__count">
            {met}/{items.length} on track
          </span>
        </div>
      </header>
      <ul className="tf-checklist__list">
        {items.map((item) => (
          <li key={item.id} className={`tf-checklist__item tf-checklist__item--${item.status}`}>
            <span className="tf-checklist__mark">
              <Mark status={item.status} />
            </span>
            <span>{item.label}</span>
            <span className="ad-visually-hidden">{STATUS_TEXT[item.status]}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
