import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { decorById, DECOR_ROTATION_STEP, type PlacedDecor } from "../../../core";

type Change = Partial<Pick<PlacedDecor, "rotation" | "scale" | "layer">>;

interface StyleToolsProps {
  readonly item: PlacedDecor | null;
  readonly topLayer: number;
  readonly onAdjust: (item: PlacedDecor, change: Change) => void;
  readonly onPutBack: (item: PlacedDecor) => void;
}

const SCALE_STEP = 0.25;

const GLYPHS = {
  turn: "M17 8.5A6.5 6.5 0 1 0 18.5 13 M17 4v4.5h-4.5",
  smaller: "M3 12h6 M6 9l3 3-3 3 M21 12h-6 M18 9l-3 3 3 3",
  bigger: "M10 12H3 M6 9l-3 3 3 3 M14 12h7 M18 9l3 3-3 3",
  front: "M5 15l7 4 7-4 M5 11l7-4 7 4-7 4z",
} as const;

function ToolButton({
  glyph,
  label,
  onClick,
}: {
  glyph: keyof typeof GLYPHS;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button variant="secondary" className="is-style__tool" onClick={onClick}>
      <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
        <path
          d={GLYPHS[glyph]}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </Button>
  );
}

export function StyleTools({ item, topLayer, onAdjust, onPutBack }: StyleToolsProps) {
  if (item === null)
    return (
      <div className="is-style__tools" aria-label="Chosen decor">
        <span className="is-style__idle">
          <Icon name="sparkle" size={18} /> Drag decor into the room. Tap a piece to turn, resize or put it
          back.
        </span>
      </div>
    );
  return (
    <div className="is-style__tools is-style__tools--chosen" aria-label="Chosen decor">
      <strong className="is-style__chosen">
        <Icon name="sparkle" size={18} /> {decorById(item.decorId).name}
      </strong>
      <div className="is-style__tool-row">
        <ToolButton
          glyph="turn"
          label="Turn"
          onClick={() => onAdjust(item, { rotation: (item.rotation + DECOR_ROTATION_STEP) % 360 })}
        />
        <ToolButton
          glyph="smaller"
          label="Smaller"
          onClick={() => onAdjust(item, { scale: Math.max(0.5, item.scale - SCALE_STEP) })}
        />
        <ToolButton
          glyph="bigger"
          label="Bigger"
          onClick={() => onAdjust(item, { scale: Math.min(2, item.scale + SCALE_STEP) })}
        />
        <ToolButton glyph="front" label="To front" onClick={() => onAdjust(item, { layer: topLayer + 1 })} />
      </div>
      <Button variant="ghost" icon="back" className="is-style__put-back" onClick={() => onPutBack(item)}>
        Back to the box
      </Button>
    </div>
  );
}
