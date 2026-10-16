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
import { careerFacts } from "../../../../../ui/newGame/careerFacts";
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
import { LarkspurBackdrop } from "../../art/LarkspurBackdrop";
import { LoftBackdrop } from "../../art/LoftBackdrop";
import { Wordmark } from "../../art/Wordmark";
import type { SaveSlotId } from "../../interiorSlots";
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
    title: "Who's moving into the loft?",
    lead: "Make your designer. Your look travels with you across the studio.",
  },
  trait: {
    title: "What makes your rooms special?",
    lead: "Your trait shapes your perks, your voice and who knocks on your door.",
  },
  career: {
    title: "Where does your story start?",
    lead: "Start in the loft, one room at a time, or take the keys to a whole street. Either way, the loft is yours.",
  },
  difficulty: {
    title: "How busy should Marigold Row be?",
    lead: "Pick the pace that suits you. Every mode tells the same story.",
  },
};

const STREET_DIFFICULTY = {
  title: "How busy should Larkspur Close be?",
  lead: "Pick the pace that suits you. Every mode tells the same story.",
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

type NewGameDraft = CareerDraft<CareerId>;

const CAREER_CARDS: readonly CareerCard<CareerId>[] = CAREERS.map((career) => ({
  id: career.id,
  name: career.name,
  pitch: career.pitch,
  placeName: career.placeName,
  badge: career.badge,
  window:
    career.id === "loft" ? (
      <LoftBackdrop decor={["swatch-wall", "loft-plant"]} />
    ) : (
      <LarkspurBackdrop time="afternoon" plot={1} />
    ),
  facts: careerFacts(career),
}));

function voiceSample(trait: TraitId, name: string): string {
  return playerVoiceSample(
    STORY_BEATS.find((beat) => beat.trigger === "intro"),
    trait,
    name,
  );
}

export function NewGameFlow({ slot, player, lookOptions, onBegin, onCancel }: NewGameFlowProps) {
  const [draft, setDraft] = useState<NewGameDraft>(() => careerPlayerDraft<CareerId>(player, "loft"));
  const [index, setIndex] = useState(0);
  const step = NEW_GAME_STEPS[index] ?? NEW_GAME_STEPS[0];
  const issue = careerStepIssue(step.id, draft, newGameIssues);
  const isLast = index === NEW_GAME_STEPS.length - 1;
  const update = (patch: Partial<NewGameDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const heading =
    step.id === "difficulty" && draft.career === "development" ? STREET_DIFFICULTY : HEADINGS[step.id];

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
    <main className="is-new-game ad-screen">
      <header className="is-new-game__header">
        <Wordmark compact heading={false} />
        <NewGameStepper steps={NEW_GAME_STEPS} index={index} />
        <span className="is-new-game__slot">Slot {slot}</span>
      </header>
      <section className="is-new-game__body" aria-labelledby="is-new-game-title">
        <div className="is-new-game__intro" key={`intro-${step.id}`}>
          <span className="ad-eyebrow">
            Step {index + 1} of {NEW_GAME_STEPS.length}
          </span>
          <h1 id="is-new-game-title" className="is-new-game__title">
            {heading.title}
          </h1>
          <p className="is-muted">{heading.lead}</p>
        </div>
        <div className="is-new-game__step" key={step.id}>
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
              skills="edging, rolling and floors"
              value={draft.difficulty}
              onChange={(difficulty) => update({ difficulty })}
            />
          ) : null}
        </div>
      </section>
      <footer className="is-new-game__footer">
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
          {isLast ? (draft.career === "development" ? "Open the site cabin" : "Open the loft") : "Next"}
        </Button>
      </footer>
    </main>
  );
}
