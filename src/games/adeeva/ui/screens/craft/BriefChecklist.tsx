import {
  checklist,
  type ChecklistItem,
  type ChecklistStatus,
  type DressRun,
  type GameState,
} from "../../../core";
import { Icon } from "../../../../../ui/kit/IconSet";
import { briefOwner } from "./briefOwner";

export interface BriefChecklistProps {
  readonly state: GameState;
  readonly run: DressRun;
  readonly variant?: "panel" | "strip" | undefined;
}

const STATUS_TEXT: Readonly<Record<ChecklistStatus, string>> = {
  met: "On track",
  unmet: "Needs attention",
  pending: "Not decided yet",
};

function StatusMark({ status }: { status: ChecklistStatus }) {
  if (status === "met") return <Icon name="check" size={14} />;
  if (status === "unmet") return <span aria-hidden="true">!</span>;
  return <Icon name="sparkle" size={12} />;
}

function ChecklistEntry({ item }: { item: ChecklistItem }) {
  return (
    <li className={`ad-brief-checklist__item ad-brief-checklist__item--${item.status}`}>
      <span className="ad-brief-checklist__mark">
        <StatusMark status={item.status} />
      </span>
      <span className="ad-brief-checklist__label">{item.label}</span>
      <span className="ad-visually-hidden">{STATUS_TEXT[item.status]}</span>
    </li>
  );
}

export function BriefChecklist({ state, run, variant = "panel" }: BriefChecklistProps) {
  const items = checklist(state);
  const { client, theme } = briefOwner(run.brief);
  const open = items.filter((item) => item.status !== "met");
  const done = items.filter((item) => item.status === "met");
  return (
    <aside className={`ad-brief-checklist ad-brief-checklist--${variant}`} aria-label="Brief checklist">
      <header className="ad-brief-checklist__header">
        <span className="ad-eyebrow">Client brief</span>
        <strong className="ad-brief-checklist__who">
          {client?.name ?? theme?.name ?? "Your design"} · {run.brief.occasion}
        </strong>
        <span className="ad-brief-checklist__count">
          <Icon name="check" size={14} /> {done.length}/{items.length} on track
        </span>
      </header>
      {variant === "strip" ? (
        open.length > 0 ? (
          <ul className="ad-brief-checklist__list">
            {open.map((item) => (
              <ChecklistEntry key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className="ad-brief-checklist__all">
            <Icon name="heart" size={16} /> Every wish is on track
          </p>
        )
      ) : (
        <>
          {open.length > 0 ? (
            <>
              <h3 className="ad-brief-checklist__group">Still to do</h3>
              <ul className="ad-brief-checklist__list">
                {open.map((item) => (
                  <ChecklistEntry key={item.id} item={item} />
                ))}
              </ul>
            </>
          ) : (
            <p className="ad-brief-checklist__all">
              <Icon name="heart" size={16} /> Every wish is on track
            </p>
          )}
          {done.length > 0 ? (
            <>
              <h3 className="ad-brief-checklist__group">On track</h3>
              <ul className="ad-brief-checklist__list ad-brief-checklist__list--done">
                {done.map((item) => (
                  <ChecklistEntry key={item.id} item={item} />
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}
    </aside>
  );
}
