import type { DifficultyDef, DifficultyId } from "../../engine/difficulty";
import { Icon, type IconName } from "../kit/IconSet";
import { ChoiceCard } from "./ChoiceCard";
import "./newGameKit.css";

export interface DifficultyStepProps {
  readonly difficulties: readonly DifficultyDef[];
  readonly icons: Readonly<Record<DifficultyId, IconName>>;
  readonly skills: string;
  readonly value: DifficultyId | null;
  readonly onChange: (difficulty: DifficultyId) => void;
}

function rentNote(multiplier: number): string {
  if (multiplier === 0) return "No rent";
  if (multiplier === 1) return "Standard rent";
  return `Rent ×${multiplier}`;
}

function toleranceNote(multiplier: number, skills: string): string {
  if (multiplier > 1) return `Gentler ${skills}`;
  if (multiplier < 1) return `Tighter ${skills}`;
  return `Classic ${skills}`;
}

export function DifficultyStep({ difficulties, icons, skills, value, onChange }: DifficultyStepProps) {
  return (
    <div className="ad-choice-grid ad-choice-grid--three" role="radiogroup" aria-label="Difficulty">
      {difficulties.map((difficulty) => (
        <ChoiceCard
          key={difficulty.id}
          label={difficulty.name}
          selected={value === difficulty.id}
          onSelect={() => onChange(difficulty.id)}
          className={`ad-difficulty ad-difficulty--${difficulty.id}`}
        >
          <span className="ad-difficulty__emblem" aria-hidden="true">
            <Icon name={icons[difficulty.id]} size={28} />
          </span>
          <span className="ad-choice__title">{difficulty.name}</span>
          <span className="ad-choice__text">{difficulty.description}</span>
          <span className="ad-difficulty__notes">
            <span>{rentNote(difficulty.rentMultiplier)}</span>
            <span>{toleranceNote(difficulty.toleranceMultiplier, skills)}</span>
          </span>
        </ChoiceCard>
      ))}
    </div>
  );
}
