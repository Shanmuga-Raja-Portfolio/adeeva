import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Icon } from "../../../../../ui/kit/IconSet";
import { checklist, clientById, type BakeRun, type GameState } from "../../../core";

export interface BriefChecklistProps {
  readonly state: GameState;
  readonly run: BakeRun;
}

export function BriefChecklist({ state, run }: BriefChecklistProps) {
  const brief = run.brief;
  if (brief === null) return null;
  const items = checklist(state, run);
  const client = clientById(brief.clientId);
  const met = items.filter((item) => item.status === "met").length;
  return (
    <aside className="pa-checklist pa-doily" aria-label="Order checklist">
      <header className="pa-checklist__head">
        {client !== undefined ? (
          <Avatar look={client.look} size={44} title={client.name} frameColour="#fde6cf" />
        ) : null}
        <div>
          <span className="ad-eyebrow">Order card</span>
          <strong>{client?.name ?? "A neighbour"}</strong>
        </div>
        <span className="pa-checklist__count">
          {met}/{items.length}
        </span>
      </header>
      <ul className="pa-checklist__list">
        {items.map((item) => (
          <li key={item.id} className={`pa-checklist__item pa-checklist__item--${item.status}`}>
            <span className="pa-checklist__mark" aria-hidden="true">
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
