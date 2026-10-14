import { useState } from "react";
import type { AvatarLook } from "../../../../../engine/avatar";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { StoryBeatDef } from "../../../content/storyBeat";
import { beatLines, currentBeat, type Action, type GameState } from "../../../core";
import { KitchenBackdrop, type BackdropScene } from "../../art/KitchenBackdrop";
import { speakerLook } from "../../art/speakers";
import "./story.css";

export interface StoryOverlayProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
}

function Portrait({
  speaker,
  isPlayer,
  playerLook,
}: {
  speaker: string;
  isPlayer: boolean;
  playerLook: AvatarLook;
}) {
  const found = isPlayer ? { look: playerLook, garment: undefined } : speakerLook(speaker);
  if (found !== null)
    return (
      <Avatar
        look={found.look}
        garment={found.garment}
        mood={isPlayer ? "delighted" : "happy"}
        size={104}
        frameColour={isPlayer ? "#f2d9a8" : "#dfe5e8"}
        title={speaker}
        className="ck-story__portrait"
      />
    );
  return (
    <span className="ck-story__portrait ck-story__portrait--narrator" aria-hidden="true">
      <Icon name="sparkle" size={40} />
    </span>
  );
}

function sceneFor(state: GameState): BackdropScene {
  if (state.rung === "student") return "school";
  return state.rung === "line" ? "hall" : "kitchen";
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
    <div className="ck-story" role="dialog" aria-modal="true" aria-labelledby="ck-story-title">
      <KitchenBackdrop scene={sceneFor(state)} className="ck-story__backdrop" />
      <div className="ck-story__veil" aria-hidden="true" />
      <div className="ck-story__tap" onPointerUp={advance} aria-hidden="true" />
      <section className="ck-story__panel ck-card">
        <header>
          <span className="ad-eyebrow">A moment in the kitchen</span>
          <h2 id="ck-story-title" className="ck-story__title">
            {beat.title}
          </h2>
        </header>
        <ol className="ck-story__history" aria-live="polite">
          {lines.slice(0, shown).map((line, index) => (
            <li
              key={index}
              className={[
                "ck-story__line",
                line.isPlayer ? "ck-story__line--player" : "",
                line.speaker === "Narrator" ? "ck-story__line--narrator" : "",
              ]
                .filter((name) => name.length > 0)
                .join(" ")}
            >
              {index === shown - 1 ? (
                <Portrait speaker={line.speaker} isPlayer={line.isPlayer} playerLook={profile.look} />
              ) : null}
              <div className="ck-story__bubble">
                {line.speaker === "Narrator" ? null : (
                  <span className="ck-story__speaker">{line.speaker}</span>
                )}
                <p>{line.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <footer className="ck-story__footer">
          <span className="ck-story__pips" aria-hidden="true">
            {lines.map((_, index) => (
              <span
                key={index}
                className={index < shown ? "ck-story__pip ck-story__pip--on" : "ck-story__pip"}
              />
            ))}
          </span>
          {finished ? (
            <Button autoFocus onClick={() => dispatch({ type: "markBeatSeen", beatId: beat.id })}>
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
