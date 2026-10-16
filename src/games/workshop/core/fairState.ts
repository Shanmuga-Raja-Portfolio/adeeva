import type { PanelScore } from "../../../engine/panelScore";
import type { BoothBackdropId } from "../content/boothBackdrop";
import type { FairBoothNumber } from "../content/fairBooth";
import type { FairMusicId } from "../content/fairMusic";
import type { FairThemeId } from "../content/fairTheme";
import type { MakersNoteId } from "../content/makersNote";
import type { FairPanelId } from "../content/panelMember";
import type { RosetteId } from "../content/rosette";

export interface FairPlan {
  readonly setId: string;
  readonly order: readonly number[];
  readonly backdrop: BoothBackdropId;
  readonly music: FairMusicId;
  readonly note: MakersNoteId;
}

export interface FairPanelScore extends PanelScore<FairPanelId> {
  readonly note: string;
}

export interface FairResult {
  readonly day: number;
  readonly seasonNumber: number;
  readonly themeId: FairThemeId;
  readonly booth: FairBoothNumber;
  readonly plan: FairPlan;
  readonly panels: readonly FairPanelScore[];
  readonly latePenalty: number;
  readonly overall: number;
  readonly rosette: RosetteId;
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
  readonly tip: string;
  readonly boothAfter: FairBoothNumber;
  readonly visitor: string;
}

export interface FairState {
  readonly booth: FairBoothNumber;
  readonly pickSetId: string | null;
  readonly visitors: readonly string[];
  readonly result: FairResult | null;
  readonly boothOffer: boolean;
  readonly rosetteRail: Readonly<Partial<Record<FairThemeId, RosetteId>>>;
  readonly rosettesBySet: Readonly<Record<string, RosetteId>>;
}

export function initialFair(visitors: readonly string[]): FairState {
  return {
    booth: 1,
    pickSetId: null,
    visitors,
    result: null,
    boothOffer: false,
    rosetteRail: {},
    rosettesBySet: {},
  };
}
