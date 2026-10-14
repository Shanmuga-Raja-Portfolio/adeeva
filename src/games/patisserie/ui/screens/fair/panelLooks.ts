import type { IconName } from "../../../../../ui/kit/IconSet";
import type { MeterTone } from "../../../../../ui/kit/Meter";
import { FAIR_PANELS, type FairPanelId } from "../../../content/panelMember";

export interface PanelLook {
  readonly icon: IconName;
  readonly tone: MeterTone;
  readonly blurb: string;
}

function blurbOf(id: FairPanelId): string {
  return FAIR_PANELS.find((panel) => panel.id === id)?.blurb ?? "";
}

export const PANEL_LOOKS: Readonly<Record<FairPanelId, PanelLook>> = {
  bench: { icon: "star", tone: "rose", blurb: blurbOf("bench") },
  garden: { icon: "palette", tone: "sage", blurb: blurbOf("garden") },
  visitors: { icon: "heart", tone: "gold", blurb: blurbOf("visitors") },
};
