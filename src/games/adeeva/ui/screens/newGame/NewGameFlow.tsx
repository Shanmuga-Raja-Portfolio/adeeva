import { useState } from "react";
import { newSeed } from "../../../../../studio/newSeed";
import type { SaveSlotId } from "../../adeevaSlots";
import type { LookOptions, StudioPlayer } from "../../../../../studio/gameModule";
import type { NewGameSettings } from "../../../core";
import { Button } from "../../../../../ui/kit/Button";
import { Wordmark } from "../title/Wordmark";
import { AvatarStep } from "./AvatarStep";
import { CareerStep } from "./CareerStep";
import { DifficultyStep } from "./DifficultyStep";
import { draftSettings, NEW_GAME_STEPS, playerDraft, stepIssue, type NewGameDraft } from "./newGameDraft";
import { NewGameStepper } from "./NewGameStepper";
import { TraitStep } from "./TraitStep";
import "./newGame.css";

export interface NewGameFlowProps {
  slot: SaveSlotId;
  player: StudioPlayer;
  lookOptions: LookOptions;
  onBegin: (settings: NewGameSettings) => void;
  onCancel: () => void;
}

const headings: Record<(typeof NEW_GAME_STEPS)[number]["id"], { title: string; lead: string }> = {
  avatar: {
    title: "Who's behind the sewing machine?",
    lead: "Make your designer. You can be anyone you like.",
  },
  trait: {
    title: "What makes your work yours?",
    lead: "Your trait shapes your perks, your voice and who comes knocking.",
  },
  career: {
    title: "Where does your story begin?",
    lead: "Students can grow into a label later. Labels start with a show.",
  },
  difficulty: {
    title: "How should the days feel?",
    lead: "Pick the pace that suits you. Every mode tells the same story.",
  },
};

export function NewGameFlow({ slot, player, lookOptions, onBegin, onCancel }: NewGameFlowProps) {
  const [draft, setDraft] = useState<NewGameDraft>(() => playerDraft(player));
  const [index, setIndex] = useState(0);
  const step = NEW_GAME_STEPS[index] ?? NEW_GAME_STEPS[0];
  const issue = stepIssue(step.id, draft);
  const isLast = index === NEW_GAME_STEPS.length - 1;
  const update = (patch: Partial<NewGameDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const heading = headings[step.id];

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
    <main className="ad-new-game ad-screen">
      <header className="ad-new-game__header">
        <Wordmark compact />
        <NewGameStepper index={index} />
        <span className="ad-new-game__slot">Slot {slot}</span>
      </header>
      <section className="ad-new-game__body" aria-labelledby="ad-new-game-title">
        <div className="ad-new-game__intro" key={`intro-${step.id}`}>
          <span className="ad-eyebrow">
            Step {index + 1} of {NEW_GAME_STEPS.length}
          </span>
          <h1 id="ad-new-game-title" className="ad-new-game__title">
            {heading.title}
          </h1>
          <p className="ad-new-game__lead">{heading.lead}</p>
        </div>
        <div className="ad-new-game__step" key={step.id}>
          {step.id === "avatar" ? (
            <AvatarStep
              name={draft.name}
              look={draft.look}
              options={lookOptions}
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
              onChange={(trait) => update({ trait })}
            />
          ) : null}
          {step.id === "career" ? (
            <CareerStep value={draft.career} onChange={(career) => update({ career })} />
          ) : null}
          {step.id === "difficulty" ? (
            <DifficultyStep value={draft.difficulty} onChange={(difficulty) => update({ difficulty })} />
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
          {isLast ? "Open the studio" : "Next"}
        </Button>
      </footer>
    </main>
  );
}
