import type { ColourId } from "../../../engine/palette";
import type { PanelScore } from "../../../engine/panelScore";
import type { StyleTag } from "../../../engine/styleTag";
import type { FairMusicId } from "../content/fairMusic";
import type { FairTentNumber } from "../content/fairTent";
import type { FairThemeId } from "../content/fairTheme";
import type { FlourishId } from "../content/flourish";
import type { PlaqueWord } from "../content/letterPath";
import type { FairPanelId } from "../content/panelMember";
import type { RibbonId } from "../content/ribbon";
import type { TableClothId } from "../content/tableCloth";
import type { BakeDesign, PlacedTopping } from "./bakeRun";

export interface TouchScore {
  readonly flourish: FlourishId;
  readonly accuracy: number;
}

export interface FairEntry {
  readonly runId: string;
  readonly design: BakeDesign;
  readonly toppings: readonly PlacedTopping[];
  readonly tags: readonly StyleTag[];
  readonly colours: readonly ColourId[];
  readonly spend: number;
  readonly budget: number;
  readonly quality: number;
  readonly touches: readonly TouchScore[];
  readonly flair: number;
  readonly word: PlaqueWord | null;
}

export interface FairPlan {
  readonly sidePlates: readonly string[];
  readonly order: readonly number[];
  readonly cloth: TableClothId;
  readonly music: FairMusicId;
}

export interface FairPanelScore extends PanelScore<FairPanelId> {
  readonly note: string;
}

export interface FairResult {
  readonly day: number;
  readonly themeId: FairThemeId;
  readonly tent: FairTentNumber;
  readonly plan: FairPlan;
  readonly panels: readonly FairPanelScore[];
  readonly latePenalty: number;
  readonly overall: number;
  readonly ribbon: RibbonId;
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
  readonly tip: string;
  readonly tentAfter: FairTentNumber;
}

export interface FairState {
  readonly seasonStartDay: number;
  readonly seasonNumber: number;
  readonly tent: FairTentNumber;
  readonly themeId: FairThemeId | null;
  readonly visitors: readonly string[];
  readonly entry: FairEntry | null;
  readonly result: FairResult | null;
  readonly tentOffer: boolean;
  readonly shownRunIds: readonly string[];
  readonly ribbonWall: Readonly<Partial<Record<FairThemeId, RibbonId>>>;
  readonly ribbonsByRun: Readonly<Record<string, RibbonId>>;
}
