import type { ColourId } from "../../../engine/palette";
import { bestSubScore, panel, subScore as part, type SubScore } from "../../../engine/panelScore";
import { weakestTip, type QualityTip } from "../../../engine/qualityTip";
import { stagingScore } from "../../../engine/showDay";
import { closerStrength } from "../../../engine/showOrder";
import type { StyleTag } from "../../../engine/styleTag";
import { hasWowTag, wowScore } from "../../../engine/wowScore";
import type { FairThemeDef } from "../content/fairTheme";
import type { FairPanelId } from "../content/panelMember";
import type { PlacedTopping } from "./bakeRun";
import type { BakeBookEntry } from "./bakeBook";
import { toppingById } from "./catalog";
import type { FairEntry, FairPanelScore, FairPlan } from "./fairState";
import { entryQuality, entryTags, SIDE_PLATES } from "./sidePlates";

export const SHOW_SLOTS = 3;

export interface ShowPlate {
  readonly quality: number;
  readonly tags: readonly StyleTag[];
  readonly colours: readonly ColourId[];
  readonly toppings: readonly PlacedTopping[];
}

const PRAISE: Readonly<Record<string, string>> = {
  craft: "Such a well-made showpiece.",
  companions: "The side plates kept it lovely company.",
  flair: "Those extra touches showed real flair.",
  cost: "Clever with the pantry, too.",
  theme: "It felt just like the theme.",
  palette: "The colours matched the theme beautifully.",
  harmony: "The plates looked like one happy family.",
  wonder: "The toppings made everyone gasp.",
  setting: "The cloth and music set the mood.",
  unveil: "The unveiling order was a treat to watch.",
};

const TIPS: Readonly<Record<string, string>> = {
  craft: "steadier weighing, stirring, baking and piping on the showpiece",
  companions: "bringing two well-made side plates from your Bake Book",
  flair: "an extra touch or two at the design step",
  cost: "keeping the showpiece's ingredients a little under budget",
  theme: "side plates that share the theme's feel",
  palette: "icing colours from the theme's palette",
  harmony: "side plates that share a colour with the showpiece",
  wonder: "bold, dreamy or regal toppings",
  setting: "the cloth and music that match the theme's mood words",
  unveil: "unveiling your best plate last",
};

export function showpiecePlate(entry: FairEntry): ShowPlate {
  return { quality: entry.quality, tags: entry.tags, colours: entry.colours, toppings: entry.toppings };
}

export function bookPlate(entry: BakeBookEntry): ShowPlate {
  return {
    quality: entryQuality(entry),
    tags: entryTags(entry),
    colours: entry.colours,
    toppings: entry.toppings,
  };
}

function wowToppings(plate: ShowPlate): number {
  const kinds = new Set(plate.toppings.map((placed) => placed.toppingId));
  return [...kinds].filter((id) => hasWowTag(toppingById(id).tags)).length;
}

function withNote(id: FairPanelId, label: string, parts: SubScore[]): FairPanelScore {
  const scored = panel(id, label, parts);
  const best = bestSubScore(parts);
  return { ...scored, note: best === null ? "" : (PRAISE[best.id] ?? "") };
}

function benchPanel(entry: FairEntry, sides: readonly ShowPlate[]): FairPanelScore {
  const companions = (sides[0]?.quality ?? 0) / SIDE_PLATES + (sides[1]?.quality ?? 0) / SIDE_PLATES;
  const cost = 100 * (1.5 - entry.spend / Math.max(1, entry.budget));
  return withNote("bench", "Bakers' Bench", [
    part("craft", "Craft", entry.quality, 0.55, `Showpiece quality ${entry.quality}.`),
    part(
      "companions",
      "Companions",
      companions,
      0.15,
      `${sides.length} of ${SIDE_PLATES} side plates on the table.`,
    ),
    part(
      "flair",
      "Flair",
      entry.flair,
      0.2,
      `${entry.touches.length} extra ${entry.touches.length === 1 ? "touch" : "touches"}.`,
    ),
    part("cost", "Sensible cost", cost, 0.1, `${entry.spend} of ${entry.budget} coins of ingredients.`),
  ]);
}

function gardenPanel(plates: readonly ShowPlate[], theme: FairThemeDef): FairPanelScore {
  const themeShare = (plate: ShowPlate) =>
    theme.tags.filter((tag) => plate.tags.includes(tag)).length / theme.tags.length;
  const themeValue = (100 * plates.reduce((sum, plate) => sum + themeShare(plate), 0)) / SHOW_SLOTS;
  const colours = plates.flatMap((plate) => plate.colours);
  const inPalette =
    colours.length === 0
      ? 0
      : colours.filter((colour) => theme.palette.includes(colour)).length / colours.length;
  const paletteValue = 100 * inPalette * (plates.length / SHOW_SLOTS);
  const [showpiece, ...sides] = plates;
  const sharing = sides.filter((plate) =>
    plate.colours.some((colour) => showpiece?.colours.includes(colour)),
  ).length;
  return withNote("garden", "Garden Club", [
    part("theme", "Theme", themeValue, 0.5, `Feels ${theme.tags.join(" and ")} across the table.`),
    part(
      "palette",
      "Palette",
      paletteValue,
      0.3,
      `${Math.round(inPalette * 100)}% of the icing from the ${theme.name} palette.`,
    ),
    part(
      "harmony",
      "Harmony",
      (100 * sharing) / SIDE_PLATES,
      0.2,
      `${sharing} side ${sharing === 1 ? "plate shares" : "plates share"} a colour with the showpiece.`,
    ),
  ]);
}

function visitorsPanel(plates: readonly ShowPlate[], theme: FairThemeDef, plan: FairPlan): FairPanelScore {
  const wowItems = Array.from({ length: SHOW_SLOTS }, (_, index) => {
    const plate = plates[index];
    return plate === undefined
      ? { wowTrims: 0, tags: [] }
      : { wowTrims: wowToppings(plate), tags: plate.tags };
  });
  const setting = stagingScore(plan.music === theme.bestMusic, plan.cloth === theme.bestCloth);
  const scores = plan.order.map((index) => plates[index]?.quality ?? 0);
  const unveil = closerStrength(scores) * (plates.length / SHOW_SLOTS);
  return withNote("visitors", "Visitors' Table", [
    part(
      "wonder",
      "Wonder",
      wowScore(wowItems),
      0.4,
      "Bold, dreamy and regal toppings make the visitors gasp.",
    ),
    part(
      "setting",
      "Setting",
      setting,
      0.3,
      plan.music === theme.bestMusic
        ? "The music suited the theme."
        : "The music pulled a little against the theme.",
    ),
    part(
      "unveil",
      "Unveil",
      unveil,
      0.3,
      closerStrength(scores) >= 100 ? "The best plate came last." : "A stronger plate could have come last.",
    ),
  ]);
}

export function fairPanels(
  entry: FairEntry,
  sides: readonly ShowPlate[],
  theme: FairThemeDef,
  plan: FairPlan,
): FairPanelScore[] {
  const plates = [showpiecePlate(entry), ...sides];
  return [benchPanel(entry, sides), gardenPanel(plates, theme), visitorsPanel(plates, theme, plan)];
}

export function fairTip(panels: readonly FairPanelScore[]): string {
  const tips: QualityTip[] = panels.flatMap((entry) =>
    entry.parts.map((item): QualityTip => [item.value, TIPS[item.id] ?? "a little more practice"]),
  );
  return `Next time, try ${weakestTip(tips)}.`;
}
