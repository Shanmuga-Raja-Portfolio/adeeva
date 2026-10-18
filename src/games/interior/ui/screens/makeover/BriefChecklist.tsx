import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Icon } from "../../../../../ui/kit/IconSet";
import { checklist, clientById, type GameState, type MakeoverRun } from "../../../core";

export interface BriefChecklistProps {
  readonly state: GameState;
  readonly run: MakeoverRun;
  readonly compact?: boolean | undefined;
}

export function BriefChecklist({ state, run, compact = false }: BriefChecklistProps) {
  const items = checklist(state, run);
  const client = clientById(run.brief.clientId);
  const met = items.filter((item) => item.status === "met").length;
  return (
    <aside
      className={compact ? "is-checklist is-checklist--compact" : "is-checklist is-tape-card"}
      aria-label="Brief checklist"
      data-testid="brief-checklist"
    >
      <header className="is-checklist__head">
        {client !== undefined ? (
          <Avatar look={client.look} size={44} title={client.name} frameColour="#fcefc2" />
        ) : null}
        <div>
          <span className="ad-eyebrow">The brief</span>
          <strong>{client?.name ?? "A neighbour"}</strong>
        </div>
        <span className="is-checklist__count">
          {met}/{items.length}
        </span>
      </header>
      {compact && met === items.length ? (
        <p className="is-checklist__done">Everything on the brief is on track!</p>
      ) : null}
      <ul className="is-checklist__list">
        {(compact ? items.filter((item) => item.status !== "met") : items).map((item) => (
          <li key={item.id} className={`is-checklist__item is-checklist__item--${item.status}`}>
            <span className="is-checklist__mark" aria-hidden="true">
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
