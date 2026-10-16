import type { IconName } from "../../../../../ui/kit/IconSet";
import type { MeterTone } from "../../../../../ui/kit/Meter";
import type { FairPanelId } from "../../../content/panelMember";

export interface PanelLook {
  readonly icon: IconName;
  readonly tone: MeterTone;
}

export const PANEL_LOOKS: Readonly<Record<FairPanelId, PanelLook>> = {
  craft: { icon: "star", tone: "gold" },
  comfort: { icon: "heart", tone: "rose" },
  harmony: { icon: "palette", tone: "sage" },
  story: { icon: "megaphone", tone: "ink" },
};
