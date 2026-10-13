import type { AvatarLook } from "../../../../../engine/avatar";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { CLIENTS } from "../../../content/client";

const OTTI_LOOK: AvatarLook = {
  skinTone: "chestnut",
  hairStyle: "short-bob",
  hairColour: "platinum",
  outfit: "studio-apron",
};

function speakerLook(speaker: string): AvatarLook | null {
  if (speaker === "Otti") return OTTI_LOOK;
  return CLIENTS.find((client) => client.name === speaker)?.look ?? null;
}

export interface SpeakerPortraitProps {
  readonly speaker: string;
  readonly isPlayer: boolean;
  readonly playerLook: AvatarLook;
}

export function SpeakerPortrait({ speaker, isPlayer, playerLook }: SpeakerPortraitProps) {
  const look = isPlayer ? playerLook : speakerLook(speaker);
  if (look === null)
    return (
      <span className="pa-story__portrait pa-story__portrait--narrator" aria-hidden="true">
        <svg viewBox="-20 -20 40 40" width={44} height={44}>
          <path d="M0 -12 A12 12 0 1 0 8 9 A9 9 0 1 1 0 -12 Z" fill="#e2b93b" />
          <path
            d="M10 -12 l1.6 3.4 3.7 0.5 -2.7 2.6 0.7 3.7 -3.3 -1.8 -3.3 1.8 0.7 -3.7 -2.7 -2.6 3.7 -0.5 Z"
            fill="#fff1cf"
          />
        </svg>
      </span>
    );
  return (
    <Avatar
      look={look}
      mood={isPlayer ? "delighted" : "happy"}
      size={112}
      frameColour={isPlayer ? "#fde6cf" : "#e7f1dc"}
      title={speaker}
      className="pa-story__portrait"
    />
  );
}
