import { useState } from "react";
import { beatLines } from "../../../../../engine/storyVoice";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { StoryBeatDef } from "../../../content/storyBeat";
import { currentBeat, type Action, type GameState } from "../../../core";
import { GarageBackdrop } from "../../art/GarageBackdrop";
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
    <div className="ww-story" role="dialog" aria-modal="true" aria-labelledby="ww-story-title">
      <GarageBackdrop
        className="ww-story__backdrop"
        decor={state.decor}
        evening={
          beat.trigger === "first-week" || beat.trigger === "bankrupt" || beat.trigger === "trait-dreamer"
        }
      />
      <div className="ww-story__veil" aria-hidden="true" />
      <div className="ww-story__tap" onPointerUp={advance} aria-hidden="true" />
      <section className="ww-story__panel ww-paper ww-tape">
        <span className="ww-pin" aria-hidden="true" />
        <header>
          <span className="ad-eyebrow">A moment on Larkspur Road</span>
          <h2 id="ww-story-title" className="ww-story__title">
            {beat.title}
          </h2>
        </header>
        <ol className="ww-story__history" aria-live="polite">
          {lines.slice(0, shown).map((line, index) => (
            <li
              key={index}
              className={[
                "ww-story__line",
                line.isPlayer ? "ww-story__line--player" : "",
                line.speaker === "Narrator" ? "ww-story__line--narrator" : "",
              ]
                .filter((name) => name.length > 0)
                .join(" ")}
            >
              {index === shown - 1 ? (
                <SpeakerPortrait speaker={line.speaker} isPlayer={line.isPlayer} playerLook={profile.look} />
              ) : null}
              <div className="ww-story__bubble">
                {line.speaker === "Narrator" ? null : (
                  <span className="ww-story__speaker">{line.speaker}</span>
                )}
                <p>{line.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <footer className="ww-story__footer">
          <span className="ww-story__pips" aria-hidden="true">
            {lines.map((_, index) => (
              <span
                key={index}
                className={index < shown ? "ww-story__pip ww-story__pip--on" : "ww-story__pip"}
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
