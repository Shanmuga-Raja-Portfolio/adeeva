export interface PoseButtonsProps {
  readonly onTurnLeft: () => void;
  readonly onTurnRight: () => void;
  readonly onSmaller: () => void;
  readonly onBigger: () => void;
}

type Glyph = "left" | "right" | "smaller" | "bigger";

function PoseGlyph({ glyph }: { readonly glyph: Glyph }) {
  const turned = glyph === "left" ? -24 : glyph === "right" ? 24 : 0;
  const side = glyph === "smaller" ? 14 : glyph === "bigger" ? 26 : 17;
  return (
    <svg className="tf-pose__glyph" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect
        x={6}
        y={6}
        width={28}
        height={28}
        rx={6}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.25}
        strokeDasharray="3 3"
      />
      <rect
        x={20 - side / 2}
        y={20 - side / 2}
        width={side}
        height={side}
        rx={4}
        fill="currentColor"
        opacity={0.85}
        transform={`rotate(${turned} 20 20)`}
      />
      {glyph === "left" || glyph === "right" ? (
        <path
          d={
            glyph === "left"
              ? "M31 10 A13 13 0 0 0 12 8 M12 8 L12 14 M12 8 L18 8"
              : "M9 10 A13 13 0 0 1 28 8 M28 8 L28 14 M28 8 L22 8"
          }
          fill="none"
          stroke="currentColor"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
}

const BUTTONS: readonly { readonly glyph: Glyph; readonly label: string; readonly name: string }[] = [
  { glyph: "left", label: "Left", name: "Turn left" },
  { glyph: "right", label: "Right", name: "Turn right" },
  { glyph: "smaller", label: "Smaller", name: "Smaller" },
  { glyph: "bigger", label: "Bigger", name: "Bigger" },
];

export function PoseButtons({ onTurnLeft, onTurnRight, onSmaller, onBigger }: PoseButtonsProps) {
  const actions: Readonly<Record<Glyph, () => void>> = {
    left: onTurnLeft,
    right: onTurnRight,
    smaller: onSmaller,
    bigger: onBigger,
  };
  return (
    <div className="tf-finish__buttons">
      {BUTTONS.map(({ glyph, label, name }) => (
        <button key={glyph} type="button" className="tf-pose" onClick={actions[glyph]} aria-label={name}>
          <PoseGlyph glyph={glyph} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
