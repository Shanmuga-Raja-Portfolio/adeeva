import { DIFFICULTIES, type DifficultyId } from "../../../content/difficulty";
import { Icon, type IconName } from "../../kit/IconSet";
import { ChoiceCard } from "./ChoiceCard";

export interface DifficultyStepProps {
  value: DifficultyId | null;
  onChange: (difficulty: DifficultyId) => void;
}

const difficultyIcons: Record<DifficultyId, IconName> = {
  relaxed: "heart",
  standard: "needle",
  challenging: "scissors",
};

function rentNote(multiplier: number): string {
  if (multiplier === 0) return "No rent";
  if (multiplier === 1) return "Standard rent";
  return `Rent ×${multiplier}`;
}

function toleranceNote(multiplier: number): string {
  if (multiplier > 1) return "Gentler cutting and sewing";
  if (multiplier < 1) return "Tighter cutting and sewing";
  return "Classic cutting and sewing";
}

export function DifficultyStep({ value, onChange }: DifficultyStepProps) {
  return (
    <div className="ad-choice-grid ad-choice-grid--three" role="radiogroup" aria-label="Difficulty">
      {DIFFICULTIES.map((difficulty) => (
        <ChoiceCard
          key={difficulty.id}
          label={difficulty.name}
          selected={value === difficulty.id}
          onSelect={() => onChange(difficulty.id)}
          className={`ad-difficulty ad-difficulty--${difficulty.id}`}
        >
          <span className="ad-difficulty__emblem" aria-hidden="true">
            <Icon name={difficultyIcons[difficulty.id]} size={28} />
          </span>
          <span className="ad-choice__title">{difficulty.name}</span>
          <span className="ad-choice__text">{difficulty.description}</span>
          <span className="ad-difficulty__notes">
            <span>{rentNote(difficulty.rentMultiplier)}</span>
            <span>{toleranceNote(difficulty.toleranceMultiplier)}</span>
          </span>
        </ChoiceCard>
      ))}
    </div>
  );
}
