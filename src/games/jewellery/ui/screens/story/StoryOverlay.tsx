import { useState } from "react";
import type { AvatarLook } from "../../../../../engine/avatar";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { CLIENTS } from "../../../content/client";
import { MENTOR_LOOK, MENTOR_NAME, type StoryBeatDef } from "../../../content/storyBeat";
import { beatLines, currentBeat, type Action, type GameState } from "../../../core";
import { ArcadeBackdrop } from "../../art/ArcadeBackdrop";
import "./story.css";

export interface StoryOverlayProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
}

function speakerLook(speaker: string): AvatarLook | null {
  if (speaker === MENTOR_NAME) return MENTOR_LOOK;
  return CLIENTS.find((client) => client.name === speaker)?.look ?? null;
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
  const look = isPlayer ? playerLook : speakerLook(speaker);
  if (look !== null)
    return (
      <Avatar
        look={look}
        mood={isPlayer ? "delighted" : "happy"}
        size={104}
        frameColour={isPlayer ? "#fbe9c8" : "#d9e9ea"}
        title={speaker}
        className="jb-story__portrait"
      />
    );
  return (
    <span className="jb-story__portrait jb-story__portrait--narrator" aria-hidden="true">
      <Icon name="sparkle" size={40} />
    </span>
  );
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
    <div className="jb-story" role="dialog" aria-modal="true" aria-labelledby="jb-story-title">
      <ArcadeBackdrop className="jb-story__backdrop" evening={beat.trigger !== "first-market-day"} />
      <div className="jb-story__veil" aria-hidden="true" />
      <div className="jb-story__tap" onPointerUp={advance} aria-hidden="true" />
      <section className="jb-story__panel jb-measure">
        <header>
          <span className="ad-eyebrow">A moment in the arcade</span>
          <h2 id="jb-story-title" className="jb-story__title">
            {beat.title}
          </h2>
        </header>
        <ol className="jb-story__history" aria-live="polite">
          {lines.slice(0, shown).map((line, index) => (
            <li
              key={index}
              className={[
                "jb-story__line",
                line.isPlayer ? "jb-story__line--player" : "",
                line.speaker === "Narrator" ? "jb-story__line--narrator" : "",
              ]
                .filter((name) => name.length > 0)
                .join(" ")}
            >
              {index === shown - 1 ? (
                <Portrait speaker={line.speaker} isPlayer={line.isPlayer} playerLook={profile.look} />
              ) : null}
              <div className="jb-story__bubble">
                {line.speaker === "Narrator" ? null : (
                  <span className="jb-story__speaker">{line.speaker}</span>
                )}
                <p>{line.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <footer className="jb-story__footer">
          <span className="jb-story__pips" aria-hidden="true">
            {lines.map((_, index) => (
              <span
                key={index}
                className={index < shown ? "jb-story__pip jb-story__pip--on" : "jb-story__pip"}
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
