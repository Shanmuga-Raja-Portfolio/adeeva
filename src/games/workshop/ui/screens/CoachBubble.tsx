import { useState } from "react";
import "./coachBubble.css";

interface CoachBubbleProps {
  readonly text: string;
  readonly show: boolean;
}

export function CoachBubble({ text, show }: CoachBubbleProps) {
  const [dismissed, setDismissed] = useState<string | null>(null);
  if (!show || dismissed === text) return null;
  return (
    <button type="button" className="ww-coach" onClick={() => setDismissed(text)} data-testid="coach-bubble">
      <span className="ww-coach__bram" aria-hidden="true">
        <svg viewBox="-20 -20 40 40" width={34} height={34}>
          <g transform="rotate(-30)">
            <rect
              x={-3}
              y={-2}
              width={6}
              height={18}
              rx={2}
              fill="#c58a4a"
              stroke="#2f2622"
              strokeWidth={2}
            />
            <rect
              x={-11}
              y={-13}
              width={22}
              height={12}
              rx={3}
              fill="#f2c230"
              stroke="#2f2622"
              strokeWidth={2}
            />
          </g>
        </svg>
      </span>
      <span className="ww-coach__text">{text}</span>
      <span className="ww-coach__ok">Got it</span>
    </button>
  );
}
