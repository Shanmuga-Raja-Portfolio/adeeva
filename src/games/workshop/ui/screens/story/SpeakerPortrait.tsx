import type { AvatarLook } from "../../../../../engine/avatar";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { REN } from "../../../content/apprentice";
import { CLIENTS } from "../../../content/client";
import { BRAM_LOOK, FAIR_PANELS } from "../../../content/panelMember";

const EXTRA_SPEAKERS: Readonly<Record<string, AvatarLook>> = {
  "Uncle Bram": BRAM_LOOK,
  Ren: REN.look,
  Kit: { skinTone: "honey", hairStyle: "pixie", hairColour: "ocean-teal", outfit: "denim-jacket" },
  Zara: { skinTone: "cocoa", hairStyle: "curly-puff", hairColour: "pastel-pink", outfit: "dungarees" },
};

function speakerLook(speaker: string): AvatarLook | null {
  const known = Object.hasOwn(EXTRA_SPEAKERS, speaker) ? EXTRA_SPEAKERS[speaker] : undefined;
  if (known !== undefined) return known;
  const member = FAIR_PANELS.flatMap((panel) => panel.members).find((entry) => entry.name === speaker);
  if (member !== undefined) return member.look;
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
      <span className="ww-story__portrait ww-story__portrait--narrator" aria-hidden="true">
        <svg viewBox="-20 -20 40 40" width={44} height={44}>
          <circle r={11} fill="#f2c230" stroke="#2f2622" strokeWidth={2} />
          <g stroke="#f2c230" strokeWidth={2.4} strokeLinecap="round">
            <path d="M0 -18 V-14 M0 14 V18 M-18 0 H-14 M14 0 H18 M-13 -13 L-10 -10 M10 10 L13 13 M13 -13 L10 -10 M-10 10 L-13 13" />
          </g>
        </svg>
      </span>
    );
  return (
    <Avatar
      look={look}
      mood={isPlayer ? "delighted" : "happy"}
      size={112}
      frameColour={isPlayer ? "#f3dcc0" : "#dfe7ee"}
      title={speaker}
      className="ww-story__portrait"
    />
  );
}
