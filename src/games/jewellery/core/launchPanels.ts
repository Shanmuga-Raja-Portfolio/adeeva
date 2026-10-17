import { average } from "../../../engine/average";
import { clamp } from "../../../engine/clamp";
import { paletteCohesion } from "../../../engine/paletteCohesion";
import { bestSubScore, panel, subScore, type SubScore } from "../../../engine/panelScore";
import { stagingScore } from "../../../engine/showDay";
import { closerStrength } from "../../../engine/showOrder";
import { weakestTip, type QualityTip } from "../../../engine/qualityTip";
import type { FinishId } from "../content/finish";
import type { LaunchThemeDef } from "../content/launchTheme";
import { LAUNCH_PANELS, type LaunchPanelId } from "../content/panelMember";
import type { CollectionPiece, LookbookPage } from "./collectionState";
import type { LaunchPanelScore, LaunchPlan } from "./launchState";
import { sheetUse } from "./lineSheet";
import { pageScore } from "./lookbook";
import { fitsTheme } from "./marketDay";
import { everyMotifCrisp } from "./motifMaster";
import { meanShimmer, stoneMatch } from "./stoneMatch";

export interface LaunchInputs {
  readonly theme: LaunchThemeDef;
  readonly pieces: readonly CollectionPiece[];
  readonly pages: readonly LookbookPage[];
  readonly plan: LaunchPlan;
  readonly finish: FinishId;
}

const FINE_METAL: Readonly<Record<number, number>> = { 1: 60, 2: 80, 3: 100 };
const FINISH_SPARKLE: Partial<Readonly<Record<FinishId, number>>> = {
  "high-shine": 100,
  starlit: 100,
  glaze: 80,
};
const OTHER_FINISH_SPARKLE = 70;

function share(count: number, total: number): number {
  return total === 0 ? 0 : count / total;
}

function pageFor(inputs: LaunchInputs, pieceId: string): LookbookPage | undefined {
  return inputs.pages.find((page) => page.pieceId === pieceId);
}

function label(id: LaunchPanelId): string {
  return LAUNCH_PANELS.find((entry) => entry.id === id)?.name ?? id;
}

const PRAISE: Readonly<Record<string, string>> = {
  craft: "Every piece was finely made.",
  cuts: "Your cuts were clean and sure.",
  joins: "The joins glowed just right.",
  sheet: "You used your metal so thriftily.",
  metal: "That metal really sparkled.",
  motif: "The motif ran through the whole line.",
  crisp: "Every motif was cut crisp and neat.",
  stones: "The stones matched like a family.",
  palette: "The colours belonged together.",
  shine: "Everything shone like new.",
  shimmer: "The stones shimmered under the lanterns.",
  light: "Your Lookbook light was lovely.",
  lantern: "The lantern colour suited the theme.",
  theme: "The line told the theme's story.",
  styling: "Your Lookbook pages were beautifully styled.",
  staging: "The music and story card were a perfect match.",
  reveal: "Saving the best for last was a treat.",
};

function scored(id: LaunchPanelId, parts: readonly SubScore[]): LaunchPanelScore {
  const result = panel(id, label(id), parts);
  const best = bestSubScore(parts);
  return { ...result, praise: best === null ? "" : (PRAISE[best.id] ?? "") };
}

function craftPanel(inputs: LaunchInputs): LaunchPanelScore {
  const { pieces } = inputs;
  const sparkle = Math.round(average(pieces.map((piece) => piece.sparkle)));
  return scored("craft", [
    subScore("craft", "Craft", average(pieces.map((piece) => piece.quality)), 0.5, "Mean piece quality"),
    subScore(
      "cuts",
      "Clean cuts",
      100 * average(pieces.map((piece) => piece.cutAccuracy)),
      0.15,
      "Cut accuracy",
    ),
    subScore(
      "joins",
      "Joins",
      100 * average(pieces.map((piece) => piece.joinAccuracy)),
      0.15,
      "Join accuracy",
    ),
    subScore("sheet", "Sheet use", clamp(200 * sheetUse(pieces), 0, 100), 0.1, "Metal used well"),
    subScore("metal", "Fine metal", FINE_METAL[sparkle] ?? 60, 0.1, "Sparkle of the line's metal"),
  ]);
}

function harmonyPanel(inputs: LaunchInputs): LaunchPanelScore {
  const { pieces } = inputs;
  const match = stoneMatch(pieces);
  const motif = 100 * share(pieces.filter((piece) => piece.carriesMotif).length, pieces.length);
  const cohesion = 100 * paletteCohesion(pieces.map((piece) => piece.colours));
  const crisp = everyMotifCrisp(pieces);
  if (match === null)
    return scored("harmony", [
      subScore("motif", "Motif", motif, 0.35, "Pieces carrying the motif"),
      subScore("crisp", "Every motif crisp", crisp, 0.2, "Weakest motif cut"),
      subScore("palette", "Palette", cohesion, 0.45, "Colours that belong together"),
    ]);
  return scored("harmony", [
    subScore("motif", "Motif", motif, 0.35, "Pieces carrying the motif"),
    subScore("crisp", "Every motif crisp", crisp, 0.2, "Weakest motif cut"),
    subScore("stones", "Stones", 100 * match, 0.25, "Stones of one tint"),
    subScore("palette", "Palette", cohesion, 0.2, "Colours that belong together"),
  ]);
}

function sparklePanel(inputs: LaunchInputs): LaunchPanelScore {
  const { pieces, theme, plan } = inputs;
  const shimmer = meanShimmer(pieces);
  const shimmerScore =
    shimmer === null ? (FINISH_SPARKLE[inputs.finish] ?? OTHER_FINISH_SPARKLE) : 25 + 25 * shimmer;
  const light = average(pieces.map((piece) => pageFor(inputs, piece.id)?.light ?? 0));
  return scored("sparkle", [
    subScore("shine", "Shine", 100 * average(pieces.map((piece) => piece.polish)), 0.35, "Mean polish"),
    subScore("shimmer", "Shimmer", shimmerScore, 0.25, "Stone shimmer"),
    subScore("light", "Lookbook light", 100 * light, 0.25, "Mean page light"),
    subScore("lantern", "Lantern", plan.lantern === theme.lantern ? 100 : 40, 0.15, "Lantern colour"),
  ]);
}

function revealScores(inputs: LaunchInputs): number[] {
  return inputs.plan.order.flatMap((id) => {
    const piece = inputs.pieces.find((entry) => entry.id === id);
    return piece === undefined ? [] : [piece.quality];
  });
}

function storyPanel(inputs: LaunchInputs): LaunchPanelScore {
  const { pieces, theme, plan } = inputs;
  const onTheme = share(pieces.filter((piece) => fitsTheme(piece, theme)).length, pieces.length);
  const styling = average(pieces.map((piece) => pageScore(pageFor(inputs, piece.id), theme)));
  return scored("story", [
    subScore("theme", "Theme", 100 * onTheme, 0.35, "Pieces on theme"),
    subScore("styling", "Styling", styling, 0.2, "Lookbook styling"),
    subScore(
      "staging",
      "Staging",
      stagingScore(plan.music === theme.music, plan.card === theme.bestCard),
      0.25,
      "Music and story card",
    ),
    subScore("reveal", "Reveal", closerStrength(revealScores(inputs)), 0.2, "Reveal order"),
  ]);
}

export function launchPanels(inputs: LaunchInputs): LaunchPanelScore[] {
  return [craftPanel(inputs), harmonyPanel(inputs), sparklePanel(inputs), storyPanel(inputs)];
}

const TIPS: Readonly<Record<string, string>> = {
  craft: "Next time, try taking a little more care on every step.",
  cuts: "Next time, try cutting slowly along the line.",
  joins: "Next time, try keeping the glow inside the gold zone.",
  sheet: "Next time, try planning pieces around the gaps on one line sheet.",
  metal: "Next time, try a metal with more sparkle.",
  motif: "Next time, try putting the motif on every piece.",
  crisp: "Next time, try cutting each motif like your motif master.",
  stones: "Next time, try stones of the same tint.",
  palette: "Next time, try colours from the theme's palette.",
  shine: "Next time, try polishing every dull spot.",
  shimmer: "Next time, try stones with more shimmer.",
  light: "Next time, try sliding the Lookbook lamp until it sparkles.",
  lantern: "Next time, try the lantern colour that matches the mood words.",
  theme: "Next time, try pieces with the theme's tags and colours.",
  styling: "Next time, try the theme's backdrop and props.",
  staging: "Next time, try the music and story card that fit the theme.",
  reveal: "Next time, try saving your favourite piece for last.",
};

export function launchTip(panels: readonly LaunchPanelScore[]): string {
  return weakestTip(
    panels.flatMap((entry) => entry.parts.map((part): QualityTip => [part.value, TIPS[part.id] ?? ""])),
  );
}
