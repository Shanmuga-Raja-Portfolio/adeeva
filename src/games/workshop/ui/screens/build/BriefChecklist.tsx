import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Icon } from "../../../../../ui/kit/IconSet";
import { checklist, clientById, type CommissionRun, type GameState } from "../../../core";

export interface BriefChecklistProps {
  readonly state: GameState;
  readonly run: CommissionRun;
}

export function BriefChecklist({ state, run }: BriefChecklistProps) {
  const items = checklist(state, run);
  const client = clientById(run.brief.clientId);
  const met = items.filter((item) => item.status === "met").length;
  return (
    <aside className="ww-checklist ww-paper" aria-label="Job checklist">
      <span className="ww-pin" aria-hidden="true" />
      <header className="ww-checklist__head">
        {client !== undefined ? (
          <Avatar look={client.look} size={44} title={client.name} frameColour="#dfe7ee" />
        ) : null}
        <div>
          <span className="ad-eyebrow">The note</span>
          <strong>{client?.name ?? "A neighbour"}</strong>
        </div>
        <span className="ww-checklist__count">
          {met}/{items.length}
        </span>
      </header>
      <ul className="ww-checklist__list">
        {items.map((item) => (
          <li key={item.id} className={`ww-checklist__item ww-checklist__item--${item.status}`}>
            <span className="ww-checklist__mark" aria-hidden="true">
              {item.status === "met" ? <Icon name="check" size={12} /> : item.status === "unmet" ? "!" : "·"}
            </span>
            <span>{item.label}</span>
            <span className="ad-visually-hidden">
              {item.status === "met"
                ? "on track"
                : item.status === "unmet"
                  ? "needs attention"
                  : "not decided yet"}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
