import type { AvatarLook } from "../../../content/avatarOption";
import { CLIENTS } from "../../../content/client";
import { Avatar } from "../../art/Avatar";
import { Icon } from "../../kit/IconSet";

export interface SpeakerPortraitProps {
  speaker: string;
  isPlayer: boolean;
  playerLook: AvatarLook;
}

function speakerLook(speaker: string): AvatarLook | null {
  const client = CLIENTS.find((entry) => speaker === entry.name || speaker.startsWith(`${entry.name},`));
  return client?.look ?? null;
}

export function SpeakerPortrait({ speaker, isPlayer, playerLook }: SpeakerPortraitProps) {
  const look = isPlayer ? playerLook : speakerLook(speaker);
  if (look !== null)
    return (
      <Avatar
        look={look}
        mood={isPlayer ? "delighted" : "happy"}
        size={112}
        frameColour={isPlayer ? "#f8dfe7" : "#e2eee5"}
        title={speaker}
        className="ad-story__portrait"
      />
    );
  if (speaker === "Narrator")
    return (
      <span className="ad-story__portrait ad-story__portrait--narrator" aria-hidden="true">
        <Icon name="needle" size={44} />
      </span>
    );
  return (
    <span className="ad-story__portrait ad-story__portrait--monogram" aria-hidden="true">
      {speaker.charAt(0)}
    </span>
  );
}
