import { useState } from "react";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Icon } from "../../../../../ui/kit/IconSet";
import { checklist, clientById, type BakeRun, type GameState } from "../../../core";
import { handsOn } from "./handsOn";
import { orderFace } from "./orderFace";

export interface BriefChecklistProps {
  readonly state: GameState;
  readonly run: BakeRun;
}

export function BriefChecklist({ state, run }: BriefChecklistProps) {
  const [opened, setOpened] = useState(false);
  const brief = run.brief;
  if (brief === null) return null;
  const items = checklist(state, run);
  const client = clientById(brief.clientId);
  const { look, name, fair } = orderFace(run);
  const met = items.filter((item) => item.status === "met").length;
  const all = items.length > 0 && met === items.length;
  const compact = handsOn(run.stage) && !opened;
  const shown = compact ? items.filter((item) => item.status !== "met") : items;
  return (
    <aside
      className={all ? "pa-checklist pa-checklist--all pa-doily" : "pa-checklist pa-doily"}
      aria-label="Order checklist"
    >
      <header className="pa-checklist__head">
        {look !== undefined ? <Avatar look={look} size={44} title={name} frameColour="#fde6cf" /> : null}
        <div>
          <span className="ad-eyebrow">{fair ? "Fair card" : "Order card"}</span>
          <strong>{name}</strong>
        </div>
        <span className="pa-checklist__count">
          {met}/{items.length}
        </span>
      </header>
      {all ? (
        <p className="pa-checklist__cheer" role="status">
          <Icon name="sparkle" size={18} /> Every wish ticked!
        </p>
      ) : null}
      {compact && met > 0 && !all ? (
        <p className="pa-checklist__ok">
          <Icon name="check" size={14} /> {met} {met === 1 ? "wish is" : "wishes are"} on track
        </p>
      ) : null}
      {shown.length > 0 ? (
        <ul className="pa-checklist__list">
          {shown.map((item) => (
            <li key={item.id} className={`pa-checklist__item pa-checklist__item--${item.status}`}>
              <span className="pa-checklist__mark" aria-hidden="true">
                {item.status === "met" ? (
                  <Icon name="check" size={12} />
                ) : item.status === "unmet" ? (
                  "!"
                ) : (
                  "·"
                )}
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
      ) : null}
      {!handsOn(run.stage) || items.length === 0 ? null : (
        <button
          type="button"
          className="pa-checklist__toggle"
          aria-expanded={opened}
          onClick={() => setOpened((open) => !open)}
        >
          {opened ? "Show less" : `See all ${items.length} wishes`}
        </button>
      )}
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
