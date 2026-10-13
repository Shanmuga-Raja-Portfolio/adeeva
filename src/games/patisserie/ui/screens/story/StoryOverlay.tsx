import { useState } from "react";
import { beatLines } from "../../../../../engine/storyVoice";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { StoryBeatDef } from "../../../content/storyBeat";
import { currentBeat, type Action, type GameState } from "../../../core";
import { BakeryBackdrop } from "../../art/BakeryBackdrop";
import { SpeakerPortrait } from "./SpeakerPortrait";
import "./story.css";

export interface StoryOverlayProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
}

function StoryScene({ state, dispatch, beat }: StoryOverlayProps & { readonly beat: StoryBeatDef }) {
  const { profile } = state;
  const lines = beatLines(beat, profile.trait, profile.name);
  const [shown, setShown] = useState(1);
  const finished = shown >= lines.length;
  const advance = () => {
    if (!finished) setShown(shown + 1);
  };
  return (
    <div className="pa-story" role="dialog" aria-modal="true" aria-labelledby="pa-story-title">
      <BakeryBackdrop
        className="pa-story__backdrop"
        evening={beat.trigger === "first-week" || beat.trigger === "bankrupt"}
      />
      <div className="pa-story__veil" aria-hidden="true" />
      <div className="pa-story__tap" onPointerUp={advance} aria-hidden="true" />
      <section className="pa-story__panel pa-doily">
        <header>
          <span className="ad-eyebrow">A moment on Larkspur Street</span>
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
          {finished ? (
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
