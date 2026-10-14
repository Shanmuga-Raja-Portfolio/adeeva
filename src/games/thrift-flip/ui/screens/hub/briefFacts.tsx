import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClientPerson } from "../../../content/client";
import { partById, recipeById, requirementName, ticketLine, type Brief } from "../../../core";

export function recipeList(brief: Brief): string {
  if (brief.kind !== "flip") return brief.occasion;
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
    .map((requirement) => `${requirement.count} × ${requirementName(requirement).toLowerCase()}`)
    .join(", ");
}

export function requestLine(brief: Brief, client: ClientPerson | undefined): string {
  return ticketLine(brief, "request") ?? client?.lines.request ?? brief.occasion;
}

export function ticketBadge(brief: Brief): string | null {
  if (brief.kind === "mend") return "Mend ticket";
  if (brief.kind === "alter") return "Fresh hem ticket";
  return null;
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
          <Icon name="bag" size={14} /> {brief.kind === "flip" ? "Budget" : "Spend up to"}
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
