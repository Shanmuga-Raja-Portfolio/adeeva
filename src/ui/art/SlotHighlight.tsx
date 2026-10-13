import type { GarmentSlot } from "../../content/garmentSlot";
import { slotAnchor } from "./slotAnchor";

export interface SlotHighlightProps {
  slot: GarmentSlot;
  tone?: "rose" | "sage" | "danger" | undefined;
}

const toneColour = { rose: "#d0587e", sage: "#5f8f6c", danger: "#c0392b" } as const;

export function SlotHighlight({ slot, tone = "rose" }: SlotHighlightProps) {
  const rect = slotAnchor(slot);
  const colour = toneColour[tone];
  return (
    <g className="ad-slot-highlight" pointerEvents="none">
      <rect
        x={rect.x - 3}
        y={rect.y - 3}
        width={rect.width + 6}
        height={rect.height + 6}
        rx={14}
        fill={colour}
        fillOpacity={0.08}
        stroke={colour}
        strokeOpacity={0.25}
        strokeWidth={8}
      />
      <rect
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        rx={11}
        fill="none"
        stroke={colour}
        strokeWidth={2}
        strokeDasharray="7 5"
        className="ad-slot-highlight__dash"
      />
    </g>
  );
}
