import { checklist, type ChecklistStatus, type DressRun, type GameState } from "../../../core";
import { Icon } from "../../kit/IconSet";
import { briefOwner } from "./briefOwner";

export interface BriefChecklistProps {
  readonly state: GameState;
  readonly run: DressRun;
  readonly title?: string | undefined;
}

const STATUS_TEXT: Readonly<Record<ChecklistStatus, string>> = {
  met: "On track",
  unmet: "Needs attention",
  pending: "Not decided yet",
};

function StatusMark({ status }: { status: ChecklistStatus }) {
  if (status === "met") return <Icon name="check" size={14} />;
  if (status === "unmet") return <span aria-hidden="true">!</span>;
  return <span aria-hidden="true">·</span>;
}

export function BriefChecklist({ state, run, title = "Client brief" }: BriefChecklistProps) {
  const items = checklist(state);
  const { client, theme } = briefOwner(run.brief);
  const met = items.filter((item) => item.status === "met").length;
  return (
    <aside className="ad-brief-checklist" aria-label="Brief checklist">
      <header className="ad-brief-checklist__header">
        <span className="ad-eyebrow">{title}</span>
        <strong className="ad-brief-checklist__who">
          {client?.name ?? theme?.name ?? "Your design"} · {run.brief.occasion}
        </strong>
        <span className="ad-brief-checklist__count">
          {met}/{items.length} on track
        </span>
      </header>
      <ul className="ad-brief-checklist__list">
        {items.map((item) => (
          <li key={item.id} className={`ad-brief-checklist__item ad-brief-checklist__item--${item.status}`}>
            <span className="ad-brief-checklist__mark">
              <StatusMark status={item.status} />
            </span>
            <span className="ad-brief-checklist__label">{item.label}</span>
            <span className="ad-visually-hidden">{STATUS_TEXT[item.status]}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
