import { useState } from "react";
import { Avatar } from "../../../../ui/art/avatar/Avatar";
import { MENTOR_LOOK, MENTOR_NAME } from "../../content/storyBeat";
import "./coachBubble.css";

export interface CoachBubbleProps {
  readonly text: string;
  readonly show: boolean;
}

export function CoachBubble({ text, show }: CoachBubbleProps) {
  const [dismissed, setDismissed] = useState<string | null>(null);
  if (!show || dismissed === text) return null;
  return (
    <button type="button" className="jb-coach" onClick={() => setDismissed(text)} data-testid="coach-bubble">
      <Avatar
        look={MENTOR_LOOK}
        size={44}
        title={MENTOR_NAME}
        frameColour="#fbe9c8"
        className="jb-coach__face"
      />
      <span className="jb-coach__text">{text}</span>
      <span className="jb-coach__ok">Got it</span>
    </button>
  );
}
