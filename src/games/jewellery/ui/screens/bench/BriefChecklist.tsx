import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Icon } from "../../../../../ui/kit/IconSet";
import { MENTOR_LOOK } from "../../../content/mentor";
import {
  checklist,
  clientById,
  launchThemeById,
  lineNameById,
  type GameState,
  type PieceRun,
} from "../../../core";

export interface BriefChecklistProps {
  readonly state: GameState;
  readonly run: PieceRun;
}

function Heading({ state, run }: BriefChecklistProps) {
  const brief = run.brief;
  const collection = state.collection;
  if (run.purpose.kind === "collection" && collection !== null) {
    const theme = collection.themeId === null ? null : launchThemeById(collection.themeId);
    return (
      <>
        <Avatar look={MENTOR_LOOK} size={44} title="Mr. Osei" frameColour="#d9e9ea" />
        <div>
          <span className="ad-eyebrow">For your line</span>
          <strong>{theme === null ? lineNameById(collection.lineNameId).name : theme.name}</strong>
        </div>
      </>
    );
  }
  const client = brief === null ? undefined : clientById(brief.clientId);
  const visitor = brief?.preset !== null && brief?.preset !== undefined;
  return (
    <>
      {client !== undefined ? (
        <Avatar look={client.look} size={44} title={client.name} frameColour="#fbe9c8" />
      ) : null}
      <div>
        <span className="ad-eyebrow">{visitor ? "Copy request" : "Order tag"}</span>
        <strong>{client?.name ?? "A neighbour"}</strong>
      </div>
    </>
  );
}

export function BriefChecklist({ state, run }: BriefChecklistProps) {
  if (run.brief === null && run.purpose.kind !== "collection") return null;
  const items = checklist(state, run);
  if (items.length === 0) return null;
  const met = items.filter((item) => item.status === "met").length;
  return (
    <aside
      className="jb-checklist jb-measure"
      aria-label={run.purpose.kind === "collection" ? "Line checklist" : "Order checklist"}
    >
      <header className="jb-checklist__head">
        <Heading state={state} run={run} />
        <span className="jb-checklist__count">
          {met}/{items.length}
        </span>
      </header>
      <ul className="jb-checklist__list">
        {items.map((item) => (
          <li key={item.id} className={`jb-checklist__item jb-checklist__item--${item.status}`}>
            <span className="jb-checklist__mark" aria-hidden="true">
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
