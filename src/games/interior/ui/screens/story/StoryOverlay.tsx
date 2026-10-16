import { useState } from "react";
import type { AvatarLook } from "../../../../../engine/avatar";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { CLIENTS } from "../../../content/client";
import { CREW } from "../../../content/crew";
import {
  BUILDER_LOOK,
  BUILDER_NAME,
  CREW_SPEAKER,
  LARKSPUR_STORY_BEATS,
} from "../../../content/larkspurStoryBeat";
import { HOME_PANELS } from "../../../content/panelMember";
import { MENTOR_LOOK, MENTOR_NAME, type StoryBeatDef } from "../../../content/storyBeat";
import { beatLines, currentBeat, storyChoiceIssue, type Action, type GameState } from "../../../core";
import { LarkspurBackdrop } from "../../art/LarkspurBackdrop";
import { LoftBackdrop } from "../../art/LoftBackdrop";
import "./story.css";

export interface StoryOverlayProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
}

const PANEL_PEOPLE = HOME_PANELS.flatMap((panel) => panel.members);

function speakerLook(speaker: string, state: GameState): AvatarLook | null {
  if (speaker === MENTOR_NAME) return MENTOR_LOOK;
  if (speaker === BUILDER_NAME) return BUILDER_LOOK;
  if (speaker === CREW_SPEAKER) {
    const hired = state.larkspur?.crew.hired[0];
    return CREW.find((member) => member.id === hired)?.look ?? CREW[0]?.look ?? null;
  }
  const panel = PANEL_PEOPLE.find((member) => member.name.includes(speaker.replace(/^(Mr|Mrs|Ms)\. /, "")));
  if (panel !== undefined) return panel.look;
  return CLIENTS.find((client) => client.name === speaker || client.name.includes(speaker))?.look ?? null;
}

function Portrait({ speaker, isPlayer, state }: { speaker: string; isPlayer: boolean; state: GameState }) {
  const look = isPlayer ? state.profile.look : speakerLook(speaker, state);
  if (look !== null)
    return (
      <Avatar
        look={look}
        mood={isPlayer ? "delighted" : "happy"}
        size={104}
        frameColour={isPlayer ? "#fcefc2" : "#dbe7f5"}
        title={speaker}
        className="is-story__portrait"
      />
    );
  return (
    <span className="is-story__portrait is-story__portrait--narrator" aria-hidden="true">
      <Icon name="sparkle" size={40} />
    </span>
  );
}

function StoryScene({ state, dispatch, beat }: StoryOverlayProps & { readonly beat: StoryBeatDef }) {
  const { profile } = state;
  const lines = beatLines(beat, profile.trait, profile.name);
  const [shown, setShown] = useState(1);
  const finished = shown >= lines.length;
  const street = LARKSPUR_STORY_BEATS.some((entry) => entry.id === beat.id);
  const firstOpenChoice = beat.choices.find((choice) => storyChoiceIssue(state, choice) === null)?.id;
  const advance = () => {
    if (!finished) setShown(shown + 1);
  };
  return (
    <div className="is-story" role="dialog" aria-modal="true" aria-labelledby="is-story-title">
      {street ? (
        <LarkspurBackdrop
          className="is-story__backdrop"
          decor={state.loftDecor}
          time={beat.trigger === "street-of-homes" ? "evening" : "afternoon"}
          plot={state.larkspur?.plot ?? null}
          keyWall={state.larkspur?.keyWall}
          openSign={beat.trigger === "first-open-house"}
        />
      ) : (
        <LoftBackdrop
          className="is-story__backdrop"
          decor={state.loftDecor}
          sign={`${profile.name}'s Studio`}
          evening={beat.trigger === "bankrupt"}
        />
      )}
      <div className="is-story__veil" aria-hidden="true" />
      <div className="is-story__tap" onPointerUp={advance} aria-hidden="true" />
      <section className="is-story__panel is-tape-card">
        <header>
          <span className="ad-eyebrow">
            {street ? "A moment on Larkspur Close" : "A moment on Marigold Row"}
          </span>
          <h2 id="is-story-title" className="is-story__title">
            {beat.title}
          </h2>
        </header>
        <ol className="is-story__history" aria-live="polite">
          {lines.slice(0, shown).map((line, index) => (
            <li
              key={index}
              className={[
                "is-story__line",
                line.isPlayer ? "is-story__line--player" : "",
                line.speaker === "Narrator" ? "is-story__line--narrator" : "",
              ]
                .filter((name) => name.length > 0)
                .join(" ")}
            >
              {index === shown - 1 ? (
                <Portrait speaker={line.speaker} isPlayer={line.isPlayer} state={state} />
              ) : null}
              <div className="is-story__bubble">
                {line.speaker === "Narrator" ? null : (
                  <span className="is-story__speaker">{line.speaker}</span>
                )}
                <p>{line.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <footer className="is-story__footer">
          <span className="is-story__pips" aria-hidden="true">
            {lines.map((_, index) => (
              <span
                key={index}
                className={index < shown ? "is-story__pip is-story__pip--on" : "is-story__pip"}
              />
            ))}
          </span>
          {finished && beat.choices.length > 0 ? (
            <span className="is-story__choices">
              {beat.choices.map((choice, index) => (
                <Button
                  key={choice.id}
                  autoFocus={choice.id === firstOpenChoice}
                  variant={index === 0 ? "primary" : "secondary"}
                  disabledReason={storyChoiceIssue(state, choice) ?? undefined}
                  onClick={() =>
                    dispatch({ type: "chooseStoryOption", beatId: beat.id, choiceId: choice.id })
                  }
                  data-testid={`story-choice-${choice.id}`}
                >
                  {choice.label}
                </Button>
              ))}
            </span>
          ) : finished ? (
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
