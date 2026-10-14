import { useState } from "react";
import type { LookOptions, StudioPlayer } from "../../../../../studio/gameModule";
import { newSeed } from "../../../../../studio/newSeed";
import { Button } from "../../../../../ui/kit/Button";
import { AvatarStep } from "../../../../../ui/newGame/AvatarStep";
import { DifficultyStep } from "../../../../../ui/newGame/DifficultyStep";
import { NewGameStepper } from "../../../../../ui/newGame/NewGameStepper";
import { TraitStep } from "../../../../../ui/newGame/TraitStep";
import "../../../../adeeva/ui/screens/newGame/newGame.css";
import type { DifficultyId } from "../../../../../engine/difficulty";
import { playerVoiceSample } from "../../../../../engine/storyVoice";
import type { TraitId } from "../../../../../engine/trait";
import type { IconName } from "../../../../../ui/kit/IconSet";
import { STORY_BEATS } from "../../../content/storyBeat";
import { CAREERS, type CareerId } from "../../../content/career";
import { DIFFICULTIES } from "../../../content/difficulty";
import { TRAITS } from "../../../content/trait";
import { newGameIssues, type NewGameSettings } from "../../../core";
import { Awning } from "../../art/Awning";
import { BoutiqueBackdrop } from "../../art/BoutiqueBackdrop";
import { StallBackdrop } from "../../art/StallBackdrop";
import { Wordmark } from "../../art/Wordmark";
import type { SaveSlotId } from "../../thriftSlots";
import { CareerStep, type CareerCard } from "../../../../../ui/newGame/CareerStep";
import { careerFacts } from "../../../../../ui/newGame/careerFacts";
import {
  CAREER_STEPS as NEW_GAME_STEPS,
  careerDraftSettings,
  careerPlayerDraft,
  careerStepIssue,
  type CareerDraft,
} from "../../../../../ui/newGame/careerDraft";
import "./newGame.css";

export interface NewGameFlowProps {
  readonly slot: SaveSlotId;
  readonly player: StudioPlayer;
  readonly lookOptions: LookOptions;
  readonly onBegin: (settings: NewGameSettings) => void;
  readonly onCancel: () => void;
}

const HEADINGS: Readonly<Record<(typeof NEW_GAME_STEPS)[number]["id"], { title: string; lead: string }>> = {
  avatar: {
    title: "Who runs the striped stall?",
    lead: "Make your maker. Your look travels with you across the studio.",
  },
  trait: {
    title: "What's your flipping style?",
    lead: "Your trait shapes your perks, your voice and who stops by.",
  },
  career: {
    title: "Where does your story start?",
    lead: "Start at the market stall, or jump into your own boutique on Larkspur Row.",
  },
  difficulty: {
    title: "How busy should the market be?",
    lead: "Pick the pace that suits you. Every mode tells the same story.",
  },
};

const traitIcons: Record<TraitId, IconName> = {
  dreamer: "sparkle",
  perfectionist: "scissors",
  trendsetter: "megaphone",
  charmer: "heart",
};

const difficultyIcons: Record<DifficultyId, IconName> = {
  relaxed: "heart",
  standard: "needle",
  challenging: "scissors",
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
  badge: career.badge,
  window: career.id === "stall" ? <StallBackdrop /> : <BoutiqueBackdrop signName="Larkspur Row" />,
  facts: careerFacts(career),
}));

export function NewGameFlow({ slot, player, lookOptions, onBegin, onCancel }: NewGameFlowProps) {
  const [draft, setDraft] = useState<NewGameDraft>(() => careerPlayerDraft<CareerId>(player, null));
  const [index, setIndex] = useState(0);
  const step = NEW_GAME_STEPS[index] ?? NEW_GAME_STEPS[0];
  const issue = careerStepIssue(step.id, draft, newGameIssues);
  const isLast = index === NEW_GAME_STEPS.length - 1;
  const update = (patch: Partial<NewGameDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const heading = HEADINGS[step.id];

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
    <main className="ad-new-game tf-new-game ad-screen">
      <Awning className="tf-new-game__awning" />
      <header className="ad-new-game__header">
        <Wordmark compact />
        <NewGameStepper index={index} steps={NEW_GAME_STEPS} />
        <span className="ad-new-game__slot">Slot {slot}</span>
      </header>
      <section className="ad-new-game__body" aria-labelledby="tf-new-game-title">
        <div className="ad-new-game__intro" key={`intro-${step.id}`}>
          <span className="ad-eyebrow">
            Step {index + 1} of {NEW_GAME_STEPS.length}
          </span>
          <h2 id="tf-new-game-title" className="ad-new-game__title">
            {heading.title}
          </h2>
          <p className="ad-new-game__lead">{heading.lead}</p>
        </div>
        <div className="ad-new-game__step" key={step.id}>
          {step.id === "avatar" ? (
            <AvatarStep
              name={draft.name}
              look={draft.look}
              options={lookOptions}
              role="designer"
              nameIssue={issue}
              onName={(name) => update({ name })}
              onLook={(look) => update({ look })}
            />
          ) : null}
          {step.id === "trait" ? (
            <TraitStep
              value={draft.trait}
              name={draft.name}
              look={draft.look}
              traits={TRAITS}
              icons={traitIcons}
              voiceSample={(trait) => voiceSample(trait, draft.name)}
              onChange={(trait) => update({ trait })}
            />
          ) : null}
          {step.id === "career" ? (
            <CareerStep cards={CAREER_CARDS} value={draft.career} onChange={(career) => update({ career })} />
          ) : null}
          {step.id === "difficulty" ? (
            <DifficultyStep
              value={draft.difficulty}
              difficulties={DIFFICULTIES}
              icons={difficultyIcons}
              skills="pulling, scrubbing, cutting and sewing"
              onChange={(difficulty) => update({ difficulty })}
            />
          ) : null}
        </div>
      </section>
      <footer className="ad-new-game__footer">
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
          {isLast ? (draft.career === "boutique" ? "Open the shop" : "Open the stall") : "Next"}
        </Button>
      </footer>
    </main>
  );
}
