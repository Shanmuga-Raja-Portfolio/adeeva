import { Icon } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { CookStepKind } from "../../../content/dish";
import { cookSteps, dishById, ingredientById, runAccuracies, stepDone, type DishRun } from "../../../core";
import { COOK_STEP_NAMES } from "./stageNames";

export function TicketChecklist({ run }: { readonly run: DishRun }) {
  const dish = dishById(run.dishId);
  const accuracies = runAccuracies(run, dish);
  const done = (kind: CookStepKind) => stepDone(run, dish, kind);
  const rows = [
    {
      key: "mise",
      label: "Everything in its place",
      ok: run.mise.length === dish.ingredients.length,
      detail: `${run.mise.length}/${dish.ingredients.length}`,
    },
    ...cookSteps(dish).map((kind) => ({
      key: kind,
      label: COOK_STEP_NAMES[kind],
      ok: done(kind),
      detail: done(kind) ? `${Math.round(accuracies[kind] * 100)}%` : "to do",
    })),
    {
      key: "plate",
      label: "Plate",
      sub: `with ${dish.plate.garnishCount} ${dish.plate.garnishCount === 1 ? "garnish" : "garnishes"}`,
      ok: run.plated !== null && run.plated.result.garnishMet,
      detail: run.plated === null ? "to do" : `${Math.round(accuracies.plate * 100)}%`,
    },
  ];
  return (
    <aside className="ck-checklist" aria-label="Ticket checklist">
      <span className="ad-eyebrow">On the ticket</span>
      <h2 className="ck-checklist__dish">{dish.name}</h2>
      {run.brief.minQuality > 0 ? (
        <p className="ck-muted">Hoping for quality {run.brief.minQuality}</p>
      ) : null}
      {run.brief.requiredTags.length > 0 ? (
        <p className="ck-checklist__tags">
          {run.brief.requiredTags.map((tag) => (
            <TagPill key={tag} tone={dish.tags.includes(tag) ? "sage" : "danger"}>
              {tag}
            </TagPill>
          ))}
        </p>
      ) : null}
      {run.brief.avoid.length > 0 ? (
        <p className="ck-muted">
          Not a fan of {run.brief.avoid.map((id) => ingredientById(id).name.toLowerCase()).join(" or ")}
        </p>
      ) : null}
      <ul className="ck-checklist__rows">
        {rows.map((row) => (
          <li
            key={row.key}
            className={row.ok ? "ck-checklist__row ck-checklist__row--ok" : "ck-checklist__row"}
          >
            <span className="ck-checklist__mark" aria-hidden="true">
              {row.ok ? <Icon name="check" size={12} /> : null}
            </span>
            <span>
              {row.label}
              {"sub" in row ? <small className="ck-checklist__sub"> {row.sub}</small> : null}
            </span>
            <span className="ck-checklist__detail">{row.detail}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
