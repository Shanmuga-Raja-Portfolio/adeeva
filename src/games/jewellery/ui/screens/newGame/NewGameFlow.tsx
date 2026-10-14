import { useState } from "react";
import type { DifficultyId } from "../../../../../engine/difficulty";
import { playerVoiceSample } from "../../../../../engine/storyVoice";
import type { TraitId } from "../../../../../engine/trait";
import type { LookOptions, StudioPlayer } from "../../../../../studio/gameModule";
import { newSeed } from "../../../../../studio/newSeed";
import { Button } from "../../../../../ui/kit/Button";
import type { IconName } from "../../../../../ui/kit/IconSet";
import { AvatarStep } from "../../../../../ui/newGame/AvatarStep";
import { DifficultyStep } from "../../../../../ui/newGame/DifficultyStep";
import { NewGameStepper } from "../../../../../ui/newGame/NewGameStepper";
import {
  draftSettings,
  PROFILE_STEPS as NEW_GAME_STEPS,
  playerDraft,
  stepIssue,
  type ProfileDraft as NewGameDraft,
} from "../../../../../ui/newGame/profileDraft";
import { TraitStep } from "../../../../../ui/newGame/TraitStep";
import { DIFFICULTIES } from "../../../content/difficulty";
import { STORY_BEATS } from "../../../content/storyBeat";
import { TRAITS } from "../../../content/trait";
import type { NewGameSettings } from "../../../core";
import { Wordmark } from "../../art/Wordmark";
import type { SaveSlotId } from "../../jewellerySlots";
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
    title: "Who sits at the Lantern Bench?",
    lead: "Make your maker. Your look travels with you across the studio.",
  },
  trait: {
    title: "What makes your pieces shine?",
    lead: "Your trait shapes your perks, your voice and who stops by.",
  },
  difficulty: {
    title: "How should the arcade feel?",
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

export function NewGameFlow({ slot, player, lookOptions, onBegin, onCancel }: NewGameFlowProps) {
  const [draft, setDraft] = useState<NewGameDraft>(() => playerDraft(player));
  const [index, setIndex] = useState(0);
  const step = NEW_GAME_STEPS[index] ?? NEW_GAME_STEPS[0];
  const issue = stepIssue(step.id, draft);
  const isLast = index === NEW_GAME_STEPS.length - 1;
  const update = (patch: Partial<NewGameDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const heading = HEADINGS[step.id];

  const next = () => {
    if (issue !== null) return;
    if (!isLast) {
      setIndex(index + 1);
      return;
    }
    const settings = draftSettings(draft, newSeed());
    if (settings !== null) onBegin(settings);
  };

  return (
    <main className="jb-new-game ad-screen">
      <header className="jb-new-game__header">
        <Wordmark compact heading={false} />
        <NewGameStepper steps={NEW_GAME_STEPS} index={index} />
        <span className="jb-new-game__slot">Slot {slot}</span>
      </header>
      <section className="jb-new-game__body" aria-labelledby="jb-new-game-title">
        <div className="jb-new-game__intro" key={`intro-${step.id}`}>
          <span className="ad-eyebrow">
            Step {index + 1} of {NEW_GAME_STEPS.length}
          </span>
          <h1 id="jb-new-game-title" className="jb-new-game__title">
            {heading.title}
          </h1>
          <p className="jb-muted">{heading.lead}</p>
        </div>
        <div className="jb-new-game__step" key={step.id}>
          {step.id === "avatar" ? (
            <AvatarStep
              name={draft.name}
              look={draft.look}
              options={lookOptions}
              role="jeweller"
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
          {step.id === "difficulty" ? (
            <DifficultyStep
              difficulties={DIFFICULTIES}
              icons={difficultyIcons}
              skills="cutting, joining and setting"
              value={draft.difficulty}
              onChange={(difficulty) => update({ difficulty })}
            />
          ) : null}
        </div>
      </section>
      <footer className="jb-new-game__footer">
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
          {isLast ? "Open the bench" : "Next"}
        </Button>
      </footer>
    </main>
  );
}
