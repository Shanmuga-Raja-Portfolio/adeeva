import { useState } from "react";
import type { AvatarLook } from "../../../../../engine/avatar";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import "../../../../adeeva/ui/screens/story/story.css";
import { BOUTIQUE_CLIENTS } from "../../../content/boutiqueClient";
import { LANDLADY_LOOK, LANDLADY_NAME } from "../../../content/boutiqueStoryBeat";
import { CLIENTS } from "../../../content/client";
import type { ShopSignId } from "../../../content/shopSign";
import { MENTOR_LOOK, MENTOR_NAME, type StoryBeatDef } from "../../../content/storyBeat";
import { TICKET_CLIENTS } from "../../../content/ticketClient";
import { beatLines, currentBeat, signById, type Action, type GameState } from "../../../core";
import { BoutiqueBackdrop } from "../../art/BoutiqueBackdrop";
import { StallBackdrop } from "../../art/StallBackdrop";
import { SignPicker } from "../boutique/SignPicker";

export interface StoryOverlayProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
}

const PEOPLE = [...CLIENTS, ...BOUTIQUE_CLIENTS, ...TICKET_CLIENTS];

function speakerLook(speaker: string): AvatarLook | null {
  if (speaker === MENTOR_NAME) return MENTOR_LOOK;
  if (speaker === LANDLADY_NAME) return LANDLADY_LOOK;
  return PEOPLE.find((client) => client.name === speaker)?.look ?? null;
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
        size={112}
        frameColour={isPlayer ? "#fde4cf" : "#e2f4ea"}
        title={speaker}
        className="ad-story__portrait"
      />
    );
  if (speaker === "Narrator")
    return (
      <span className="ad-story__portrait ad-story__portrait--narrator" aria-hidden="true">
        <Icon name="hanger" size={44} />
      </span>
    );
  return (
    <span className="ad-story__portrait ad-story__portrait--monogram" aria-hidden="true">
      {speaker.charAt(0)}
    </span>
  );
}

function StoryScene({ state, dispatch, beat }: StoryOverlayProps & { readonly beat: StoryBeatDef }) {
  const { profile } = state;
  const lines = beatLines(beat, profile.trait, profile.name);
  const [shown, setShown] = useState(1);
  const [signing, setSigning] = useState<string | null>(null);
  const finished = shown >= lines.length;
  const boutique =
    state.boutique !== null || beat.trigger === "boutique-offer" || beat.trigger === "intro-boutique";
  const choose = (choiceId: string, signId: ShopSignId | null) =>
    dispatch({ type: "chooseStoryOption", beatId: beat.id, choiceId, signId });
  const advance = () => {
    if (!finished) setShown(shown + 1);
  };
  return (
    <div className="ad-story tf-story" role="dialog" aria-modal="true" aria-labelledby="tf-story-title">
      {boutique ? (
        <BoutiqueBackdrop
          className="ad-story__backdrop"
          dusk={beat.trigger === "bankrupt"}
          signName={state.boutique === null ? "Mrs. Pell's" : signById(state.boutique.signId).name}
        />
      ) : (
        <StallBackdrop className="ad-story__backdrop" dusk={beat.trigger === "bankrupt"} />
      )}
      <div className="ad-story__veil" aria-hidden="true" />
      <div className="ad-story__tap" onPointerUp={advance} aria-hidden="true" />
      <section className="ad-story__panel">
        <header className="ad-story__header">
          <span className="ad-eyebrow">
            {state.boutique === null ? "A moment at the stall" : "A moment on Larkspur Row"}
          </span>
          <h2 id="tf-story-title" className="ad-story__title">
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
                <Portrait speaker={line.speaker} isPlayer={line.isPlayer} playerLook={profile.look} />
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
          {finished && beat.choices.length > 0 ? (
            <span className="tf-story__choices">
              {beat.choices.map((choice, index) => (
                <Button
                  key={choice.id}
                  autoFocus={index === 0}
                  variant={index === 0 ? "primary" : "secondary"}
                  onClick={() =>
                    choice.effect === "open-boutique" ? setSigning(choice.id) : choose(choice.id, null)
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
      <SignPicker
        open={signing !== null}
        onClose={() => setSigning(null)}
        onPick={(signId) => {
          if (signing !== null) choose(signing, signId);
          setSigning(null);
        }}
      />
    </div>
  );
}

export function StoryOverlay({ state, dispatch }: StoryOverlayProps) {
  const beat = currentBeat(state);
  if (beat === null) return null;
  return <StoryScene key={beat.id} state={state} dispatch={dispatch} beat={beat} />;
}
