import type { AvatarLook } from "../../../content/avatarOption";
import { STORY_BEATS } from "../../../content/storyBeat";
import { TRAITS, type TraitId } from "../../../content/trait";
import { beatLines } from "../../../core";
import { Avatar } from "../../art/Avatar";
import { Icon, type IconName } from "../../kit/IconSet";
import { ChoiceCard } from "./ChoiceCard";

export interface TraitStepProps {
  value: TraitId | null;
  name: string;
  look: AvatarLook;
  onChange: (trait: TraitId) => void;
}

const traitIcons: Record<TraitId, IconName> = {
  dreamer: "sparkle",
  perfectionist: "scissors",
  trendsetter: "megaphone",
  charmer: "heart",
};

function voiceSample(trait: TraitId, name: string): string {
  const intro = STORY_BEATS.find((beat) => beat.trigger === "intro-student");
  if (intro === undefined) return "";
  return beatLines(intro, trait, name).find((line) => line.isPlayer)?.text ?? "";
}

export function TraitStep({ value, name, look, onChange }: TraitStepProps) {
  return (
    <div className="ad-choice-grid ad-choice-grid--four" role="radiogroup" aria-label="Trait">
      {TRAITS.map((trait) => (
        <ChoiceCard
          key={trait.id}
          label={trait.name}
          selected={value === trait.id}
          onSelect={() => onChange(trait.id)}
          className={`ad-trait ad-trait--${trait.id}`}
        >
          <span className="ad-trait__emblem" aria-hidden="true">
            <Icon name={traitIcons[trait.id]} size={26} />
          </span>
          <span className="ad-choice__title">{trait.name}</span>
          <span className="ad-choice__tagline">{trait.tagline}</span>
          <span className="ad-trait__perk">
            <span className="ad-eyebrow">Perk</span>
            {trait.perk}
          </span>
          <span className="ad-trait__voice">
            <Avatar look={look} size={36} title={name.trim().length > 0 ? name.trim() : "You"} />
            <span className="ad-trait__quote">“{voiceSample(trait.id, name)}”</span>
          </span>
          <span className="ad-trait__voice-label">Voice: {trait.voice}</span>
        </ChoiceCard>
      ))}
    </div>
  );
}
