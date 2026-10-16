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
import { careerFacts } from "../../../../../ui/newGame/careerFacts";
import { DifficultyStep } from "../../../../../ui/newGame/DifficultyStep";
import { NewGameStepper } from "../../../../../ui/newGame/NewGameStepper";
import { TraitStep } from "../../../../../ui/newGame/TraitStep";
import { CAREERS, type CareerId } from "../../../content/career";
import { DIFFICULTIES } from "../../../content/difficulty";
import { STORY_BEATS } from "../../../content/storyBeat";
import { TRAITS } from "../../../content/trait";
import { newGameIssues, type NewGameSettings } from "../../../core";
import { GarageBackdrop } from "../../art/GarageBackdrop";
import { ShowroomBackdrop } from "../../art/ShowroomBackdrop";
import { Wordmark } from "../../art/Wordmark";
import type { SaveSlotId } from "../../workshopSlots";
import "./newGame.css";

export interface NewGameFlowProps {
  readonly slot: SaveSlotId;
  readonly player: StudioPlayer;
  readonly lookOptions: LookOptions;
  readonly onBegin: (settings: NewGameSettings) => void;
  readonly onCancel: () => void;
}

const headings: Record<(typeof NEW_GAME_STEPS)[number]["id"], { title: string; lead: string }> = {
  avatar: { title: "Who's in the garage?", lead: "Make your maker. Goggles and apron come free." },
  trait: {
    title: "What kind of maker are you?",
    lead: "Your trait shapes your perks, your voice and who knocks on the door.",
  },
  career: {
    title: "Where does your maker story begin?",
    lead: "Garage makers can open the showroom later. Showroom makers start with matched sets, Ren and the Craft Fair.",
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
  name: career.id === "garage" ? "Garage Workshop" : "Furniture Showroom",
  pitch: career.pitch,
  placeName: career.workshopName,
  badge: career.badge,
  window:
    career.id === "garage" ? (
      <GarageBackdrop className="ww-career-window" />
    ) : (
      <ShowroomBackdrop className="ww-career-window" />
    ),
  facts: careerFacts(career),
}));

export function NewGameFlow({ slot, player, lookOptions, onBegin, onCancel }: NewGameFlowProps) {
  const [draft, setDraft] = useState<NewGameDraft>(() => careerPlayerDraft<CareerId>(player, "garage"));
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
    <main className="ww-new-game ad-screen">
      <header className="ww-new-game__header">
        <Wordmark compact />
        <NewGameStepper steps={NEW_GAME_STEPS} index={index} />
        <span className="ww-new-game__slot">Slot {slot}</span>
      </header>
      <section className="ww-new-game__body" aria-labelledby="ww-new-game-title">
        <div className="ww-new-game__intro" key={`intro-${step.id}`}>
          <span className="ad-eyebrow">
            Step {index + 1} of {NEW_GAME_STEPS.length}
          </span>
          <h1 id="ww-new-game-title" className="ww-new-game__title">
            {heading.title}
          </h1>
          <p className="ww-muted">{heading.lead}</p>
        </div>
        <div className="ww-new-game__step" key={step.id}>
          {step.id === "avatar" ? (
            <AvatarStep
              name={draft.name}
              look={draft.look}
              options={lookOptions}
              role="maker"
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
              skills="sawing and joining"
              value={draft.difficulty}
              onChange={(difficulty) => update({ difficulty })}
            />
          ) : null}
        </div>
      </section>
      <footer className="ww-new-game__footer">
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
          {isLast ? (draft.career === "showroom" ? "Open the showroom" : "Open the garage") : "Next"}
        </Button>
      </footer>
    </main>
  );
}
