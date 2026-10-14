import { Icon } from "../../../../../ui/kit/IconSet";
import { ChoiceCard } from "../../../../../ui/newGame/ChoiceCard";
import { CAREER, type StartId } from "../../../content/career";
import { rungById } from "../../../core";
import { KitchenBackdrop } from "../../art/KitchenBackdrop";

export interface StartStepProps {
  readonly value: StartId | null;
  readonly onChange: (start: StartId) => void;
}

const STARTS: readonly {
  readonly id: StartId;
  readonly title: string;
  readonly pitch: string;
  readonly coins: number;
  readonly reputation: number;
  readonly note: string;
}[] = [
  {
    id: "student",
    title: "Cookery Student",
    pitch: "Meet all six mentors at Larkspur Cookery School and climb the whole ladder.",
    coins: CAREER.startCoins,
    reputation: CAREER.startReputation.student,
    note: "The full story, one rung at a time.",
  },
  {
    id: "head",
    title: "Head Chef",
    pitch: "Jump straight into the Main Kitchen: write the menu and lead a team.",
    coins: CAREER.headStart.coins,
    reputation: CAREER.startReputation.head,
    note: "Every cuisine starts at Confident.",
  },
];

export function StartStep({ value, onChange }: StartStepProps) {
  return (
    <div className="ad-choice-grid ad-choice-grid--two" role="radiogroup" aria-label="Start">
      {STARTS.map((start) => (
        <ChoiceCard
          key={start.id}
          label={start.title}
          selected={value === start.id}
          onSelect={() => onChange(start.id)}
          className="ck-start"
        >
          <span className="ck-start__window">
            <KitchenBackdrop scene={start.id === "student" ? "school" : "kitchen"} />
            <span className="ck-start__place">
              {rungById(start.id === "student" ? "student" : "head").place}
            </span>
          </span>
          <span className="ck-start__body">
            <span className="ad-choice__title">{start.title}</span>
            <span className="ad-choice__text">{start.pitch}</span>
            <span className="ck-start__facts">
              <span>
                <Icon name="coin" size={16} /> {start.coins} coins to start
              </span>
              <span>
                <Icon name="star" size={16} /> Reputation {start.reputation}
              </span>
              <span>
                <Icon name="sparkle" size={16} /> {start.note}
              </span>
            </span>
          </span>
        </ChoiceCard>
      ))}
    </div>
  );
}
