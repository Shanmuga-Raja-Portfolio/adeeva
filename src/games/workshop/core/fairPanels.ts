import { bestSubScore, panel, subScore as part, type SubScore } from "../../../engine/panelScore";
import { weakestTip, type QualityTip } from "../../../engine/qualityTip";
import { stagingScore } from "../../../engine/showDay";
import { closerStrength } from "../../../engine/showOrder";
import type { FairThemeDef } from "../content/fairTheme";
import type { JointKindId } from "../content/jointKind";
import type { FairPanelId } from "../content/panelMember";
import type { ShadeId } from "../content/shade";
import { hammersFor } from "../content/wood";
import { productById, woodById } from "./catalog";
import type { FairPanelScore, FairPlan } from "./fairState";
import type { FloorSet } from "./showroomState";

export const SET_JOINT_POINTS: Readonly<Record<JointKindId, number>> = { peg: 60, slot: 80, comb: 100 };
export const FINE_WOOD_POINTS: readonly number[] = [60, 80, 100];
export const AWNING_POINTS = 5;

const PRAISE: Readonly<Record<string, string>> = {
  craft: "Beautifully made, through and through.",
  joints: "Every joint sits snug and true.",
  "set-joint": "That matching joint caught every eye.",
  "fine-wood": "Such a fine, tough wood.",
  smooth: "Silky smooth to the touch.",
  cosy: "It looks so inviting.",
  solid: "It looks solid and dependable.",
  faces: "Matching faces, like twins.",
  evenness: "Every piece shines the same.",
  palette: "The colours sing with the theme.",
  hardware: "The knobs and extras match beautifully.",
  theme: "It feels just like the theme.",
  setting: "The backdrop and music set the mood.",
  reveal: "The reveal saved the best for last.",
};

const TIPS: Readonly<Record<string, string>> = {
  craft: "steadier sawing, joining and sanding on every piece",
  joints: "nudging each joint right onto its shadow",
  "set-joint": "a comb joint as the set joint",
  "fine-wood": "a tougher wood with more hammers",
  smooth: "sanding along the wood lines until each piece is silky",
  cosy: "a cushion on the seats, or a cosy touch",
  solid: "a sturdy wood or sturdy part choices",
  faces: "fitting matching faces side by side on one board",
  evenness: "taking the same care over every piece",
  palette: "colours from the theme's palette",
  hardware: "the same knob or extra on every piece",
  theme: "parts, wood and a finish with the theme's feel",
  setting: "the backdrop and music that match the theme's mood words",
  reveal: "revealing your best piece last",
};

export interface HarmonyInput {
  readonly matchedFaces: number | null;
  readonly evenness: number;
  readonly palette: number;
  readonly hardware: number;
}

function withNote(id: FairPanelId, label: string, parts: SubScore[], bonus = 0): FairPanelScore {
  const scored = panel(id, label, parts);
  const best = bestSubScore(parts);
  return {
    ...scored,
    score: Math.min(100, scored.score + bonus),
    note: best === null ? "" : (PRAISE[best.id] ?? ""),
  };
}

function share(count: number, total: number): number {
  return total === 0 ? 0 : (100 * count) / total;
}

export function paletteShare(colours: readonly ShadeId[], palette: readonly ShadeId[]): number {
  return colours.length === 0
    ? 0
    : colours.filter((colour) => palette.includes(colour)).length / colours.length;
}

function craftPanel(set: FloorSet): FairPanelScore {
  const hammers = hammersFor(woodById(set.woodId));
  return withNote("craft", "Craft Bench", [
    part("craft", "Craft", set.stats.quality, 0.5, `Set quality ${set.stats.quality}.`),
    part(
      "joints",
      "Joints",
      set.stats.jointAccuracy * 100,
      0.2,
      `Joints ${Math.round(set.stats.jointAccuracy * 100)}% snug.`,
    ),
    part(
      "set-joint",
      "Set joint",
      SET_JOINT_POINTS[set.setJoint],
      0.1,
      `Every show joint is a ${set.setJoint} joint.`,
    ),
    part(
      "fine-wood",
      "Fine wood",
      FINE_WOOD_POINTS[hammers - 1] ?? 60,
      0.2,
      `${woodById(set.woodId).name}: ${hammers} ${hammers === 1 ? "hammer" : "hammers"}.`,
    ),
  ]);
}

function comfortPanel(set: FloorSet): FairPanelScore {
  const seats = set.pieces.filter((piece) => productById(piece.productId).seat);
  const cosy =
    seats.length > 0
      ? share(set.cushion === null ? 0 : seats.length, seats.length)
      : share(set.pieces.filter((piece) => piece.tags.includes("cosy")).length, set.pieces.length);
  const hammers = hammersFor(woodById(set.woodId));
  const solid = share(
    set.pieces.filter((piece) => piece.tags.includes("sturdy") || hammers >= 2).length,
    set.pieces.length,
  );
  return withNote("comfort", "Comfort Corner", [
    part(
      "smooth",
      "Smooth to touch",
      set.stats.sandScore * 100,
      0.4,
      `Surfaces ${Math.round(set.stats.sandScore * 100)}% smooth.`,
    ),
    part(
      "cosy",
      "Cosy touches",
      cosy,
      0.3,
      seats.length > 0
        ? set.cushion === null
          ? "No cushions on the seats yet."
          : "Every seat has a matching cushion."
        : `${Math.round(cosy)}% of the pieces feel cosy.`,
    ),
    part("solid", "Solid look", solid, 0.3, `${Math.round(solid)}% of the pieces look solid.`),
  ]);
}

export function harmonyPanel(input: HarmonyInput): FairPanelScore {
  const evennessWeight = input.matchedFaces === null ? 0.6 : 0.3;
  const faces: SubScore[] =
    input.matchedFaces === null
      ? []
      : [
          part(
            "faces",
            "Matched faces",
            input.matchedFaces * 100,
            0.3,
            `${Math.round(input.matchedFaces * 100)}% of the matching faces share a board.`,
          ),
        ];
  return withNote("harmony", "Harmony Table", [
    ...faces,
    part("evenness", "Evenness", input.evenness, evennessWeight, `Evenness ${input.evenness}.`),
    part(
      "palette",
      "Palette",
      input.palette * 100,
      0.2,
      `${Math.round(input.palette * 100)}% of the colours from the palette.`,
    ),
    part("hardware", "Matching hardware", input.hardware, 0.2, `Hardware match ${input.hardware}.`),
  ]);
}

function storyPanel(set: FloorSet, theme: FairThemeDef, plan: FairPlan, awning: boolean): FairPanelScore {
  const themeValue = share(
    theme.tags.filter((tag) => set.stats.tags.includes(tag)).length,
    theme.tags.length,
  );
  const setting = stagingScore(plan.music === theme.bestMusic, plan.backdrop === theme.bestBackdrop);
  const scores = plan.order.map((index) => set.pieces[index]?.quality ?? 0);
  const reveal = closerStrength(scores);
  return withNote(
    "story",
    "Story Wall",
    [
      part(
        "theme",
        "Theme",
        themeValue,
        0.4,
        `Feels ${theme.tags.join(" and ")}: ${Math.round(themeValue)}%.`,
      ),
      part(
        "setting",
        "Booth setting",
        setting,
        0.3,
        plan.music === theme.bestMusic
          ? "The music suited the theme."
          : "The music pulled a little against the theme.",
      ),
      part(
        "reveal",
        "Reveal",
        reveal,
        0.3,
        reveal >= 100 ? "The best piece came last." : "A stronger piece could come last.",
      ),
    ],
    awning ? AWNING_POINTS : 0,
  );
}

export function fairPanels(
  set: FloorSet,
  theme: FairThemeDef,
  plan: FairPlan,
  awning: boolean,
): FairPanelScore[] {
  return [
    craftPanel(set),
    comfortPanel(set),
    harmonyPanel({
      matchedFaces: set.stats.matchedFaces,
      evenness: set.stats.evenness,
      palette: paletteShare(set.stats.colours, theme.palette),
      hardware: set.stats.hardware,
    }),
    storyPanel(set, theme, plan, awning),
  ];
}

export function fairTip(panels: readonly FairPanelScore[]): string {
  const tips: QualityTip[] = panels.flatMap((entry) =>
    entry.parts.map((item): QualityTip => [item.value, TIPS[item.id] ?? "a little more practice"]),
  );
  return `Next time, try ${weakestTip(tips)}.`;
}
