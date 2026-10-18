import type { IconName } from "../../../../../../ui/kit/IconSet";
import type { CriterionId } from "../../../../core/criterion";

const ICONS: Readonly<Record<CriterionId, IconName>> = {
  construction: "needle",
  quality: "star",
  style: "sparkle",
  colours: "palette",
  finishes: "scissors",
  budget: "coin",
  deadline: "calendar",
  sustainability: "heart",
  kept: "hanger",
};

export function criterionIcon(id: CriterionId): IconName {
  return ICONS[id];
}
