import { CAREERS, type CareerId } from "../../../content/career";
import { StudioBackdrop } from "../../art/StudioBackdrop";
import { Icon } from "../../../../../ui/kit/IconSet";
import { ChoiceCard } from "./ChoiceCard";

export interface CareerStepProps {
  value: CareerId | null;
  onChange: (career: CareerId) => void;
}

export function CareerStep({ value, onChange }: CareerStepProps) {
  return (
    <div className="ad-choice-grid ad-choice-grid--two" role="radiogroup" aria-label="Career">
      {CAREERS.map((career) => (
        <ChoiceCard
          key={career.id}
          label={career.name}
          selected={value === career.id}
          onSelect={() => onChange(career.id)}
          className="ad-career"
        >
          <span className="ad-career__window">
            <StudioBackdrop kind={career.id === "student" ? "bedroom" : "atelier"} wash={0.05} />
            <span className="ad-career__studio">{career.studioName}</span>
          </span>
          <span className="ad-career__body">
            <span className="ad-choice__title">{career.name}</span>
            <span className="ad-choice__text">{career.pitch}</span>
            <span className="ad-career__facts">
              <span>
                <Icon name="coin" size={16} /> {career.startCoins} coins to start
              </span>
              <span>
                <Icon name="star" size={16} /> Reputation {career.startReputation}
              </span>
              <span>
                <Icon name="calendar" size={16} /> Rent {career.weeklyRent} a week
              </span>
              <span>
                <Icon name="bag" size={16} /> Side job: {career.shiftName}
              </span>
            </span>
          </span>
        </ChoiceCard>
      ))}
    </div>
  );
}
