import type { ReactNode } from "react";
import { Icon, type IconName } from "../kit/IconSet";
import { ChoiceCard } from "./ChoiceCard";
import "./newGameKit.css";

export interface CareerFact {
  readonly icon: IconName;
  readonly text: string;
}

export interface CareerCard<C extends string> {
  readonly id: C;
  readonly name: string;
  readonly pitch: string;
  readonly placeName: string;
  readonly badge?: string | undefined;
  readonly window: ReactNode;
  readonly facts: readonly CareerFact[];
}

export interface CareerStepProps<C extends string> {
  readonly cards: readonly CareerCard<C>[];
  readonly value: C | null;
  readonly onChange: (career: C) => void;
}

export function CareerStep<C extends string>({ cards, value, onChange }: CareerStepProps<C>) {
  return (
    <div className="ad-choice-grid ad-choice-grid--two" role="radiogroup" aria-label="Career">
      {cards.map((card) => (
        <ChoiceCard
          key={card.id}
          label={card.name}
          selected={value === card.id}
          onSelect={() => onChange(card.id)}
          className="ad-career"
        >
          <span className="ad-career__window">
            {card.window}
            <span className="ad-career__studio">{card.placeName}</span>
          </span>
          <span className="ad-career__body">
            <span className="ad-choice__title">{card.name}</span>
            {card.badge === undefined ? null : <span className="ad-career__badge">{card.badge}</span>}
            <span className="ad-choice__text">{card.pitch}</span>
            <span className="ad-career__facts">
              {card.facts.map((fact) => (
                <span key={fact.text}>
                  <Icon name={fact.icon} size={16} /> {fact.text}
                </span>
              ))}
            </span>
          </span>
        </ChoiceCard>
      ))}
    </div>
  );
}
