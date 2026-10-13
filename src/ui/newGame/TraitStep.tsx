import type { AvatarLook } from "../../engine/avatar";
import type { TraitDef, TraitId } from "../../engine/trait";
import { Avatar } from "../art/avatar/Avatar";
import { Icon, type IconName } from "../kit/IconSet";
import { ChoiceCard } from "./ChoiceCard";
import "./newGameKit.css";

export interface TraitStepProps {
  readonly traits: readonly TraitDef[];
  readonly icons: Readonly<Record<TraitId, IconName>>;
  readonly voiceSample: (trait: TraitId) => string;
  readonly value: TraitId | null;
  readonly name: string;
  readonly look: AvatarLook;
  readonly onChange: (trait: TraitId) => void;
}

export function TraitStep({ traits, icons, voiceSample, value, name, look, onChange }: TraitStepProps) {
  return (
    <div className="ad-choice-grid ad-choice-grid--four" role="radiogroup" aria-label="Trait">
      {traits.map((trait) => (
        <ChoiceCard
          key={trait.id}
          label={trait.name}
          selected={value === trait.id}
          onSelect={() => onChange(trait.id)}
          className={`ad-trait ad-trait--${trait.id}`}
        >
          <span className="ad-trait__emblem" aria-hidden="true">
            <Icon name={icons[trait.id]} size={26} />
          </span>
          <span className="ad-choice__title">{trait.name}</span>
          <span className="ad-choice__tagline">{trait.tagline}</span>
          <span className="ad-trait__perk">
            <span className="ad-eyebrow">Perk</span>
            {trait.perk}
          </span>
          <span className="ad-trait__voice">
            <Avatar look={look} size={36} title={name.trim().length > 0 ? name.trim() : "You"} />
            <span className="ad-trait__quote">“{voiceSample(trait.id)}”</span>
          </span>
          <span className="ad-trait__voice-label">Voice: {trait.voice}</span>
        </ChoiceCard>
      ))}
    </div>
  );
}
