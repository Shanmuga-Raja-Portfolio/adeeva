import { Icon } from "../../../../../ui/kit/IconSet";
import { partById, patchById, recipeById, trimById, type Brief } from "../../../core";

export function recipeList(brief: Brief): string {
  const names = brief.recipes.map((recipeId) => recipeById(recipeId).name);
  const parts =
    brief.partIds === null
      ? ""
      : ` (${brief.partIds.map((partId) => partById(partId)?.name ?? partId).join(", ")} only)`;
  return `${names.join(" or ")}${parts}`;
}

export function finishList(brief: Brief): string {
  if (brief.requiredFinishes.length === 0) return "No extras";
  return brief.requiredFinishes
    .map((requirement) => {
      const name =
        requirement.kind === "trim"
          ? trimById(requirement.trim).name
          : requirement.patch === "any"
            ? "any patch"
            : patchById(requirement.patch).name;
      return `${requirement.count} × ${name}`;
    })
    .join(", ");
}

export interface BriefFactsProps {
  readonly brief: Brief;
}

export function BriefFacts({ brief }: BriefFactsProps) {
  return (
    <dl className="tf-facts">
      <div>
        <dt>
          <Icon name="coin" size={14} /> Fee
        </dt>
        <dd>{brief.fee}</dd>
      </div>
      <div>
        <dt>
          <Icon name="bag" size={14} /> Budget
        </dt>
        <dd>{brief.budget}</dd>
      </div>
      <div>
        <dt>
          <Icon name="calendar" size={14} /> Due
        </dt>
        <dd>Day {brief.deadlineDay}</dd>
      </div>
      <div>
        <dt>
          <Icon name="star" size={14} /> Quality
        </dt>
        <dd>{brief.minQuality}+</dd>
      </div>
    </dl>
  );
}
