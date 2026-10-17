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
import type { LineNameId } from "../../../content/lineName";
import { STORY_BEATS } from "../../../content/storyBeat";
import { TRAITS } from "../../../content/trait";
import { newGameIssues, seasonByNumber, type NewGameSettings } from "../../../core";
import { ArcadeBackdrop } from "../../art/ArcadeBackdrop";
import { LoftBackdrop } from "../../art/LoftBackdrop";
import { Wordmark } from "../../art/Wordmark";
import { LineNamePicker } from "../loft/LineNamePicker";
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
  career: {
    title: "Where does your jewellery story begin?",
    lead: "Bench jewellers can open the Lantern Loft later. Loft designers start with a whole line to launch.",
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

type NewGameDraft = CareerDraft<CareerId>;

const CAREER_CARDS: readonly CareerCard<CareerId>[] = CAREERS.map((career) => ({
  id: career.id,
  name: career.cardName,
  pitch: career.pitch,
  placeName: career.placeName,
  badge: career.badge,
  window:
    career.id === "bench" ? (
      <ArcadeBackdrop className="jb-career-window" />
    ) : (
      <LoftBackdrop className="jb-career-window" dusk={seasonByNumber(1).dusk} garland={[]} />
    ),
  facts: careerFacts(career),
}));

const DEFAULT_LINE: LineNameId = "little-lantern";

export function NewGameFlow({ slot, player, lookOptions, onBegin, onCancel }: NewGameFlowProps) {
  const [draft, setDraft] = useState<NewGameDraft>(() => careerPlayerDraft<CareerId>(player, "bench"));
  const [lineNameId, setLineNameId] = useState<LineNameId | null>(null);
  const [index, setIndex] = useState(0);
  const step = NEW_GAME_STEPS[index] ?? NEW_GAME_STEPS[0];
  const lineIssue =
    step.id === "career" && draft.career === "collection" && lineNameId === null
      ? "Pick a name for your line."
      : null;
  const issue =
    lineIssue ??
    careerStepIssue(step.id, draft, (settings) =>
      newGameIssues({ ...settings, lineNameId: lineNameId ?? DEFAULT_LINE }),
    );
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
    if (settings !== null) onBegin({ ...settings, lineNameId: lineNameId ?? DEFAULT_LINE });
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
          {step.id === "career" ? (
            <div className="jb-new-game__career">
              <CareerStep
                cards={CAREER_CARDS}
                value={draft.career}
                onChange={(career) => update({ career })}
              />
              {draft.career === "collection" ? (
                <LineNamePicker value={lineNameId} onChange={setLineNameId} />
              ) : null}
            </div>
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
          {isLast ? (draft.career === "collection" ? "Open the Lantern Loft" : "Open the bench") : "Next"}
        </Button>
      </footer>
    </main>
  );
}
