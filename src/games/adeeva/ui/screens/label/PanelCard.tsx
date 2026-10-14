import type { PanelScore } from "../../../core";
import type { IconName } from "../../../../../ui/kit/IconSet";
import type { MeterTone } from "../../../../../ui/kit/Meter";
import { PanelCard as ShowPanelCard } from "../../../../../ui/kit/PanelCard";

export interface PanelCardProps {
  panel: PanelScore;
  order: number;
  instant: boolean;
}

const PANEL_LOOK: Record<PanelScore["id"], { icon: IconName; tone: MeterTone; blurb: string }> = {
  critics: { icon: "star", tone: "rose", blurb: "Craft, theme and cohesion" },
  buyers: { icon: "bag", tone: "sage", blurb: "Would it sell on Monday?" },
  audience: { icon: "heart", tone: "gold", blurb: "Gasps, cheers and phone screens" },
};

function verdict(score: number): string {
  if (score >= 85) return "Adored it";
  if (score >= 70) return "Loved it";
  if (score >= 50) return "Warmed to it";
  if (score >= 30) return "Curious";
  return "Not yet won over";
}

export function PanelCard({ panel, order, instant }: PanelCardProps) {
  const look = PANEL_LOOK[panel.id];
  return (
    <ShowPanelCard
      panel={panel}
      order={order}
      instant={instant}
      icon={look.icon}
      tone={look.tone}
      blurb={look.blurb}
      verdict={verdict(panel.score)}
    />
  );
}
