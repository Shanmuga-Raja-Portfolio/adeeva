import { useState } from "react";
import type { StoryBeatDef } from "../../../content/storyBeat";
import { beatLines, currentBeat, type Action, type GameState } from "../../../core";
import { StudioBackdrop } from "../../art/StudioBackdrop";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { SpeakerPortrait } from "./SpeakerPortrait";
import "./story.css";

export interface StoryOverlayProps {
  state: GameState;
  dispatch: (action: Action) => void;
}

interface StorySceneProps extends StoryOverlayProps {
  beat: StoryBeatDef;
}

function StoryScene({ state, dispatch, beat }: StorySceneProps) {
  const { profile } = state;
  const lines = beatLines(beat, profile.trait, profile.name);
  const [shown, setShown] = useState(1);
  const finished = shown >= lines.length;
  const advance = () => {
    if (!finished) setShown(shown + 1);
  };

  return (
    <div className="ad-story" role="dialog" aria-modal="true" aria-labelledby="ad-story-title">
      <StudioBackdrop
        kind={profile.career === "student" ? "bedroom" : "atelier"}
        wash={0.2}
        className="ad-story__backdrop"
      />
      <div className="ad-story__veil" aria-hidden="true" />
      <div className="ad-story__tap" onPointerUp={advance} aria-hidden="true" />
      <section className="ad-story__panel">
        <header className="ad-story__header">
          <span className="ad-eyebrow">A moment in the studio</span>
          <h2 id="ad-story-title" className="ad-story__title">
            {beat.title}
          </h2>
        </header>
        <ol className="ad-story__history" aria-live="polite">
          {lines.slice(0, shown).map((line, index) => (
            <li
              key={index}
              className={[
                "ad-story__line",
                line.isPlayer ? "ad-story__line--player" : "",
                line.speaker === "Narrator" ? "ad-story__line--narrator" : "",
                index === shown - 1 ? "ad-story__line--current" : "",
              ]
                .filter((name) => name.length > 0)
                .join(" ")}
            >
              {index === shown - 1 ? (
                <SpeakerPortrait speaker={line.speaker} isPlayer={line.isPlayer} playerLook={profile.look} />
              ) : null}
              <div className="ad-story__bubble">
                {line.speaker === "Narrator" ? null : (
                  <span className="ad-story__speaker">{line.speaker}</span>
                )}
                <p className="ad-story__text">{line.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <footer className="ad-story__footer">
          <span className="ad-story__progress" aria-hidden="true">
            {lines.map((_, index) => (
              <span
                key={index}
                className={index < shown ? "ad-story__pip ad-story__pip--on" : "ad-story__pip"}
              />
            ))}
          </span>
          {!finished ? (
            <Button autoFocus variant="secondary" onClick={advance}>
              Tap to continue
              <Icon name="sparkle" size={16} />
            </Button>
          ) : beat.choices.length > 0 ? (
            <div className="ad-story__choices">
              {beat.choices.map((choice, index) => (
                <Button
                  key={choice.id}
                  autoFocus={index === 0}
                  variant={index === 0 ? "primary" : "secondary"}
                  onClick={() =>
                    dispatch({ type: "chooseStoryOption", beatId: beat.id, choiceId: choice.id })
                  }
                >
                  {choice.label}
                </Button>
              ))}
            </div>
          ) : (
            <Button autoFocus onClick={() => dispatch({ type: "markBeatSeen", beatId: beat.id })}>
              Continue
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
