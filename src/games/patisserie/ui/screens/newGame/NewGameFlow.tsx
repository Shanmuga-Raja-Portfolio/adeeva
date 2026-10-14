import { useState } from "react";
import type { DifficultyId } from "../../../../../engine/difficulty";
import { playerVoiceSample } from "../../../../../engine/storyVoice";
import type { TraitId } from "../../../../../engine/trait";
import type { LookOptions, StudioPlayer } from "../../../../../studio/gameModule";
import { newSeed } from "../../../../../studio/newSeed";
import { Button } from "../../../../../ui/kit/Button";
import type { IconName } from "../../../../../ui/kit/IconSet";
import { AvatarStep } from "../../../../../ui/newGame/AvatarStep";
import { CareerStep, type CareerCard } from "../../../../../ui/newGame/CareerStep";
import {
  CAREER_STEPS as NEW_GAME_STEPS,
  careerDraftSettings,
  careerPlayerDraft,
  careerStepIssue,
  type CareerDraft,
} from "../../../../../ui/newGame/careerDraft";
import { DifficultyStep } from "../../../../../ui/newGame/DifficultyStep";
import { NewGameStepper } from "../../../../../ui/newGame/NewGameStepper";
import { TraitStep } from "../../../../../ui/newGame/TraitStep";
import { CAREERS, type CareerId } from "../../../content/career";
import { DIFFICULTIES } from "../../../content/difficulty";
import { STORY_BEATS } from "../../../content/storyBeat";
import { TRAITS } from "../../../content/trait";
import { newGameIssues, type NewGameSettings } from "../../../core";
import { BakeryBackdrop } from "../../art/BakeryBackdrop";
import { CometRoomBackdrop } from "../../art/CometRoomBackdrop";
import type { SaveSlotId } from "../../patisserieSlots";
import { Wordmark } from "../title/Wordmark";
import "./newGame.css";

export interface NewGameFlowProps {
  readonly slot: SaveSlotId;
  readonly player: StudioPlayer;
  readonly lookOptions: LookOptions;
  readonly onBegin: (settings: NewGameSettings) => void;
  readonly onCancel: () => void;
}

const headings: Record<(typeof NEW_GAME_STEPS)[number]["id"], { title: string; lead: string }> = {
  avatar: { title: "Who's behind the counter?", lead: "Make your baker. You can be anyone you like." },
  trait: {
    title: "What makes your bakes yours?",
    lead: "Your trait shapes your perks, your voice and who drops by.",
  },
  career: {
    title: "Where does your baking story begin?",
    lead: "Corner Bakers can open the tea salon later. Salon Pâtissiers start with the parlour and the Fair.",
  },
  difficulty: {
    title: "How should the days feel?",
    lead: "Pick the pace that suits you. Every mode tells the same story.",
  },
};

const traitIcons: Record<TraitId, IconName> = {
  dreamer: "sparkle",
  perfectionist: "check",
  trendsetter: "megaphone",
  charmer: "heart",
};

const difficultyIcons: Record<DifficultyId, IconName> = {
  relaxed: "heart",
  standard: "clock",
  challenging: "star",
};

function voiceSample(trait: TraitId, name: string): string {
  return playerVoiceSample(
    STORY_BEATS.find((beat) => beat.trigger === "intro"),
    trait,
    name,
  );
}

type NewGameDraft = CareerDraft<CareerId>;

const CAREER_CARDS: readonly CareerCard<CareerId>[] = CAREERS.map((career) => ({
  id: career.id,
  name: career.name,
  pitch: career.pitch,
  placeName: career.placeName,
  window:
    career.id === "bakery" ? (
      <BakeryBackdrop className="pa-career-window" />
    ) : (
      <CometRoomBackdrop className="pa-career-window" />
    ),
  facts: [
    { icon: "coin", text: `${career.startCoins} coins to start` },
    { icon: "star", text: `Reputation ${career.startReputation}` },
    { icon: "calendar", text: `Rent ${career.weeklyRent} a week` },
    { icon: "bag", text: `Side job: ${career.shiftName}` },
  ],
}));

export function NewGameFlow({ slot, player, lookOptions, onBegin, onCancel }: NewGameFlowProps) {
  const [draft, setDraft] = useState<NewGameDraft>(() => careerPlayerDraft<CareerId>(player, "bakery"));
  const [index, setIndex] = useState(0);
  const step = NEW_GAME_STEPS[index] ?? NEW_GAME_STEPS[0];
  const issue = careerStepIssue(step.id, draft, newGameIssues);
  const isLast = index === NEW_GAME_STEPS.length - 1;
  const update = (patch: Partial<NewGameDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const heading = headings[step.id];

  const next = () => {
    if (issue !== null) return;
    if (!isLast) {
      setIndex(index + 1);
      return;
    }
    const settings = careerDraftSettings(draft, newSeed());
    if (settings !== null) onBegin(settings);
  };

  return (
    <main className="pa-new-game ad-screen">
      <header className="pa-new-game__header">
        <Wordmark compact />
        <NewGameStepper steps={NEW_GAME_STEPS} index={index} />
        <span className="pa-new-game__slot">Slot {slot}</span>
      </header>
      <section className="pa-new-game__body" aria-labelledby="pa-new-game-title">
        <div className="pa-new-game__intro" key={`intro-${step.id}`}>
          <span className="ad-eyebrow">
            Step {index + 1} of {NEW_GAME_STEPS.length}
          </span>
          <h1 id="pa-new-game-title" className="pa-new-game__title">
            {heading.title}
          </h1>
          <p className="pa-muted">{heading.lead}</p>
        </div>
        <div className="pa-new-game__step" key={step.id}>
          {step.id === "avatar" ? (
            <AvatarStep
              name={draft.name}
              look={draft.look}
              options={lookOptions}
              role="baker"
              nameIssue={issue}
              onName={(name) => update({ name })}
              onLook={(look) => update({ look })}
            />
          ) : null}
          {step.id === "trait" ? (
            <TraitStep
              traits={TRAITS}
              icons={traitIcons}
              voiceSample={(trait) => voiceSample(trait, draft.name)}
              value={draft.trait}
              name={draft.name}
              look={draft.look}
              onChange={(trait) => update({ trait })}
            />
          ) : null}
          {step.id === "career" ? (
            <CareerStep cards={CAREER_CARDS} value={draft.career} onChange={(career) => update({ career })} />
          ) : null}
          {step.id === "difficulty" ? (
            <DifficultyStep
              difficulties={DIFFICULTIES}
              icons={difficultyIcons}
              skills="weighing, oven and piping"
              value={draft.difficulty}
              onChange={(difficulty) => update({ difficulty })}
            />
          ) : null}
        </div>
      </section>
      <footer className="pa-new-game__footer">
        <Button variant="ghost" onClick={() => (index === 0 ? onCancel() : setIndex(index - 1))}>
          {index === 0 ? "Back to title" : "Back"}
        </Button>
        <Button
          size="lg"
          icon={isLast ? "sparkle" : undefined}
          disabledReason={issue ?? undefined}
          showReason
          onClick={next}
        >
          {isLast ? (draft.career === "salon" ? "Open the Comet Room" : "Open the bakery") : "Next"}
        </Button>
      </footer>
    </main>
  );
}
