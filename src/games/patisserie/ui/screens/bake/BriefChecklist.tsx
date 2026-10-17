import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Icon } from "../../../../../ui/kit/IconSet";
import { MARIGOLD } from "../../../content/panelMember";
import { checklist, clientById, type BakeRun, type GameState } from "../../../core";

export interface BriefChecklistProps {
  readonly state: GameState;
  readonly run: BakeRun;
}

export function BriefChecklist({ state, run }: BriefChecklistProps) {
  const brief = run.brief;
  if (brief === null) return null;
  const items = checklist(state, run);
  const fair = run.purpose.kind === "showpiece";
  const client = clientById(brief.clientId);
  const look = client?.look ?? (fair ? MARIGOLD.look : undefined);
  const met = items.filter((item) => item.status === "met").length;
  return (
    <aside className="pa-checklist pa-doily" aria-label="Order checklist">
      <header className="pa-checklist__head">
        {look !== undefined ? (
          <Avatar look={look} size={44} title={client?.name ?? MARIGOLD.name} frameColour="#fde6cf" />
        ) : null}
        <div>
          <span className="ad-eyebrow">{fair ? "Fair card" : "Order card"}</span>
          <strong>{client?.name ?? (fair ? "The Larkspur Fair" : "A neighbour")}</strong>
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
      {client !== undefined && run.stage !== "brief" ? (
        <figure className="pa-checklist__note">
          <span className="pa-checklist__pin" aria-hidden="true" />
          <blockquote>“{client.lines.request}”</blockquote>
          <figcaption>{client.name}</figcaption>
        </figure>
      ) : null}
    </aside>
  );
}
