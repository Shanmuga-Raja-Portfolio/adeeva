import { CAREERS, type CareerId } from "../../../content/career";
import { StudioBackdrop } from "../../art/StudioBackdrop";
import { CareerStep as SharedCareerStep, type CareerCard } from "../../../../../ui/newGame/CareerStep";

export interface CareerStepProps {
  value: CareerId | null;
  onChange: (career: CareerId) => void;
}

const CARDS: readonly CareerCard<CareerId>[] = CAREERS.map((career) => ({
  id: career.id,
  name: career.name,
  pitch: career.pitch,
  placeName: career.studioName,
  window: <StudioBackdrop kind={career.id === "student" ? "bedroom" : "atelier"} wash={0.05} />,
  facts: [
    { icon: "coin", text: `${career.startCoins} coins to start` },
    { icon: "star", text: `Reputation ${career.startReputation}` },
    { icon: "calendar", text: `Rent ${career.weeklyRent} a week` },
    { icon: "bag", text: `Side job: ${career.shiftName}` },
  ],
}));

export function CareerStep({ value, onChange }: CareerStepProps) {
  return <SharedCareerStep cards={CARDS} value={value} onChange={onChange} />;
}
