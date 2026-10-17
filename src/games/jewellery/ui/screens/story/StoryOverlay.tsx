import { useState } from "react";
import type { AvatarLook } from "../../../../../engine/avatar";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { CLIENTS } from "../../../content/client";
import type { LineNameId } from "../../../content/lineName";
import { LOFT_STORY_BEATS } from "../../../content/loftStoryBeat";
import { MENTOR_LOOK, MENTOR_NAME } from "../../../content/mentor";
import { KEMI_LOOK, KEMI_NAME, LAUNCH_PANELS } from "../../../content/panelMember";
import { POPUP_VISITORS } from "../../../content/popupVisitor";
import type { StoryBeatDef } from "../../../content/storyBeat";
import {
  beatLines,
  currentBeat,
  loftRents,
  seasonByNumber,
  storyChoiceIssue,
  type Action,
  type GameState,
} from "../../../core";
import { ArcadeBackdrop } from "../../art/ArcadeBackdrop";
import { LoftBackdrop } from "../../art/LoftBackdrop";
import { garlandLights } from "../loft/garlandLights";
import { LineNamePicker } from "../loft/LineNamePicker";
import "./story.css";

export interface StoryOverlayProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
}

const PANEL_PEOPLE = LAUNCH_PANELS.flatMap((panel) => panel.members);

function speakerLook(speaker: string): AvatarLook | null {
  if (speaker === MENTOR_NAME) return MENTOR_LOOK;
  if (speaker === KEMI_NAME) return KEMI_LOOK;
  return (
    [...CLIENTS, ...POPUP_VISITORS].find((person) => person.name === speaker)?.look ??
    PANEL_PEOPLE.find((person) => person.name === speaker)?.look ??
    null
  );
}

const LOFT_BEAT_IDS = new Set(LOFT_STORY_BEATS.map((beat) => beat.id));

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
  const [lineNameId, setLineNameId] = useState<LineNameId | null>(null);
  const finished = shown >= lines.length;
  const loft = LOFT_BEAT_IDS.has(beat.id);
  const naming = beat.choices.some((choice) => choice.effect === "open-loft");
  const advance = () => {
    if (!finished) setShown(shown + 1);
  };
  return (
    <div className="jb-story" role="dialog" aria-modal="true" aria-labelledby="jb-story-title">
      {loft ? (
        <LoftBackdrop
          className="jb-story__backdrop"
          dusk={seasonByNumber(state.collection?.seasonNumber ?? 1).dusk}
          evening
          garland={garlandLights(state)}
        />
      ) : (
        <ArcadeBackdrop className="jb-story__backdrop" evening={beat.trigger !== "first-market-day"} />
      )}
      <div className="jb-story__veil" aria-hidden="true" />
      <div className="jb-story__tap" onPointerUp={advance} aria-hidden="true" />
      <section className="jb-story__panel jb-measure">
        <header>
          <span className="ad-eyebrow">
            {loft ? "A moment in the Lantern Loft" : "A moment in the arcade"}
          </span>
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
        {finished && naming ? (
          <>
            <p className="jb-muted" data-testid="story-rent-note">
              Bench and loft rent: {loftRents(state.profile.difficulty).loft} coins a week (bench only:{" "}
              {loftRents(state.profile.difficulty).bench}).
            </p>
            <LineNamePicker value={lineNameId} onChange={setLineNameId} />
          </>
        ) : null}
        <footer className="jb-story__footer">
          <span className="jb-story__pips" aria-hidden="true">
            {lines.map((_, index) => (
              <span
                key={index}
                className={index < shown ? "jb-story__pip jb-story__pip--on" : "jb-story__pip"}
              />
            ))}
          </span>
          {finished && beat.choices.length > 0 ? (
            <span className="jb-story__choices">
              {beat.choices.map((choice, index) => {
                const issue = storyChoiceIssue(state, choice, lineNameId);
                return (
                  <Button
                    key={choice.id}
                    autoFocus={index === beat.choices.length - 1}
                    variant={index === 0 ? "primary" : "secondary"}
                    disabledReason={issue ?? undefined}
                    showReason={issue !== null}
                    onClick={() =>
                      dispatch({
                        type: "chooseStoryOption",
                        beatId: beat.id,
                        choiceId: choice.id,
                        lineNameId,
                      })
                    }
                    data-testid={`story-choice-${choice.id}`}
                  >
                    {choice.label}
                  </Button>
                );
              })}
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
