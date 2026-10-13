import { useState } from "react";
import { Icon } from "../../../../ui/kit/IconSet";
import "./guideBubble.css";

export interface GuideBubbleProps {
  readonly text: string;
  readonly show: boolean;
}

export function GuideBubble({ text, show }: GuideBubbleProps) {
  const [dismissed, setDismissed] = useState<string | null>(null);
  if (!show || dismissed === text) return null;
  return (
    <button type="button" className="pa-guide" onClick={() => setDismissed(text)} data-testid="guide-bubble">
      <span className="pa-guide__otti" aria-hidden="true">
        <Icon name="sparkle" size={18} />
      </span>
      <span className="pa-guide__text">{text}</span>
      <span className="pa-guide__ok">Got it</span>
    </button>
  );
}
