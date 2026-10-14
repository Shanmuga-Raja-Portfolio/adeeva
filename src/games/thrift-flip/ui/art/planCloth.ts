import type { Cloth } from "../../../../ui/art/cloth/Cloth";
import type { RecipeId } from "../../content/recipe";

export const PLAN_CLOTH: Readonly<Record<RecipeId, Cloth>> = {
  "scrunchie-trio": { id: "plan-scrunchie", colour: "blush", material: "cotton", print: "dot" },
  "cushion-cover": { id: "plan-cushion", colour: "sage", material: "linen", print: "solid" },
  "tote-bag": { id: "plan-tote", colour: "mustard", material: "cotton", print: "stripe" },
  "bucket-hat": { id: "plan-hat", colour: "sky", material: "cotton", print: "check" },
  "remade-skirt": { id: "plan-skirt", colour: "navy", material: "cotton", print: "floral" },
  "remade-top": { id: "plan-top", colour: "coral", material: "cotton", print: "solid" },
};
