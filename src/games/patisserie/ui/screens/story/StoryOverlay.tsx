import { useState } from "react";
import { beatLines } from "../../../../../engine/storyVoice";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { StoryBeatDef, StoryTrigger } from "../../../content/storyBeat";
import { currentBeat, storyChoiceIssue, type Action, type GameState } from "../../../core";
import { BakeryBackdrop } from "../../art/BakeryBackdrop";
import { CometRoomBackdrop } from "../../art/CometRoomBackdrop";
import { GlasshouseBackdrop } from "../../art/GlasshouseBackdrop";
import { SpeakerPortrait } from "./SpeakerPortrait";
import "./story.css";

export interface StoryOverlayProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
}

const SALON_TRIGGERS: readonly StoryTrigger[] = [
  "salon-offer",
  "intro-salon",
  "salon-open",
  "first-salon-day",
  "otti-tea",
  "charmer-parlour",
  "parlour-grace",
];

const FAIR_TRIGGERS: readonly StoryTrigger[] = [
  "fair-invite",
  "first-fair-done",
  "gold-ribbon",
  "tent-glasshouse",
  "tent-grand",
  "ribbon-wall",
  "every-hook-gold",
  "trendsetter-preview",
  "fair-skipped",
];

function StoryBackdrop({ beat }: { readonly beat: StoryBeatDef }) {
  if (SALON_TRIGGERS.includes(beat.trigger)) return <CometRoomBackdrop className="pa-story__backdrop" />;
  if (FAIR_TRIGGERS.includes(beat.trigger))
    return <GlasshouseBackdrop className="pa-story__backdrop" lights={0.9} />;
  return (
    <BakeryBackdrop
      className="pa-story__backdrop"
      evening={beat.trigger === "first-week" || beat.trigger === "bankrupt"}
    />
  );
}

function StoryScene({ state, dispatch, beat }: StoryOverlayProps & { readonly beat: StoryBeatDef }) {
  const { profile } = state;
  const lines = beatLines(beat, profile.trait, profile.name);
  const [shown, setShown] = useState(1);
  const finished = shown >= lines.length;
  const firstOpenChoice = beat.choices.find((choice) => storyChoiceIssue(state, choice) === null)?.id;
  const advance = () => {
    if (!finished) setShown(shown + 1);
  };
  return (
    <div className="pa-story" role="dialog" aria-modal="true" aria-labelledby="pa-story-title">
      <StoryBackdrop beat={beat} />
      <div className="pa-story__veil" aria-hidden="true" />
      <div className="pa-story__tap" onPointerUp={advance} aria-hidden="true" />
      <section className="pa-story__panel pa-doily">
        <header>
          <span className="ad-eyebrow">
            {FAIR_TRIGGERS.includes(beat.trigger)
              ? "At the Larkspur Patisserie Fair"
              : "A moment on Larkspur Street"}
          </span>
          <h2 id="pa-story-title" className="pa-story__title">
            {beat.title}
          </h2>
        </header>
        <ol className="pa-story__history" aria-live="polite">
          {lines.slice(0, shown).map((line, index) => (
            <li
              key={index}
              className={[
                "pa-story__line",
                line.isPlayer ? "pa-story__line--player" : "",
                line.speaker === "Narrator" ? "pa-story__line--narrator" : "",
              ]
                .filter((name) => name.length > 0)
                .join(" ")}
            >
              {index === shown - 1 ? (
                <SpeakerPortrait speaker={line.speaker} isPlayer={line.isPlayer} playerLook={profile.look} />
              ) : null}
              <div className="pa-story__bubble">
                {line.speaker === "Narrator" ? null : (
                  <span className="pa-story__speaker">{line.speaker}</span>
                )}
                <p>{line.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <footer className="pa-story__footer">
          <span className="pa-story__pips" aria-hidden="true">
            {lines.map((_, index) => (
              <span
                key={index}
                className={index < shown ? "pa-story__pip pa-story__pip--on" : "pa-story__pip"}
              />
            ))}
          </span>
          {finished && beat.choices.length > 0 ? (
            <span className="pa-story__choices">
              {beat.choices.map((choice, index) => (
                <Button
                  key={choice.id}
                  autoFocus={choice.id === firstOpenChoice}
                  variant={index === 0 ? "primary" : "secondary"}
                  icon={index === 0 ? "sparkle" : undefined}
                  disabledReason={storyChoiceIssue(state, choice) ?? undefined}
                  showReason
                  onClick={(event) => {
                    if (event.detail <= 1)
                      dispatch({ type: "chooseStoryOption", beatId: beat.id, choiceId: choice.id });
                  }}
                >
                  {choice.label}
                </Button>
              ))}
            </span>
          ) : finished ? (
            <Button
              autoFocus
              onClick={(event) => {
                if (event.detail <= 1) dispatch({ type: "markBeatSeen", beatId: beat.id });
              }}
            >
              Continue
            </Button>
          ) : (
            <Button autoFocus variant="secondary" onClick={advance}>
              Tap to continue
              <Icon name="sparkle" size={16} />
            </Button>
          )}
        </footer>
      </section>
    </div>
  );
}

export function StoryOverlay({ state, dispatch }: StoryOverlayProps) {
  const beat = currentBeat(state);
  if (beat === null) return null;
  return <StoryScene key={beat.id} state={state} dispatch={dispatch} beat={beat} />;
}
