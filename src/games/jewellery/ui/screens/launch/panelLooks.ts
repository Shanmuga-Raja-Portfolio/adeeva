import type { IconName } from "../../../../../ui/kit/IconSet";
import type { MeterTone } from "../../../../../ui/kit/Meter";
import type { LaunchPanelId } from "../../../content/panelMember";

export interface PanelLook {
  readonly icon: IconName;
  readonly tone: MeterTone;
}

export const PANEL_LOOKS: Readonly<Record<LaunchPanelId, PanelLook>> = {
  craft: { icon: "star", tone: "gold" },
  harmony: { icon: "palette", tone: "sage" },
  sparkle: { icon: "sparkle", tone: "rose" },
  story: { icon: "megaphone", tone: "ink" },
};
