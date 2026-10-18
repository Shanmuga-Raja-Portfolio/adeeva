import { useState } from "react";
import { colourById } from "../../../../../engine/palette";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { useAfterFirstPaint } from "../../../../../ui/kit/useAfterFirstPaint";
import { useSvgId } from "../../../../../ui/art/useSvgId";
import { RUNWAY_LIGHTS, type RunwayLightId } from "../../../../adeeva/content/runwayLight";
import { MUSIC_MOODS, type MusicMoodId } from "../../../../../engine/musicMood";
import { LightPicker } from "../../../../adeeva/ui/screens/label/LightPicker";
import { MoodPicker } from "../../../../adeeva/ui/screens/label/MoodPicker";
import { HINTS } from "../../../content/hint";
import type { SeasonDef } from "../../../content/season";
import {
  hallTip,
  isLateShowcaseDay,
  recipeById,
  shelfPieces,
  showcaseIssues,
  storyCardsFor,
  suggestedShelf,
  type Action,
  type GameState,
  type ShowcasePlan,
} from "../../../core";
import { pieceCloth } from "../../art/findCloth";
import { HallBackdrop } from "../../art/HallBackdrop";
import { ProductPreview } from "../../art/ProductPreview";
import { LeaveDraftDialog } from "../boutique/LeaveDraftDialog";
import { StoryCardArt } from "./StoryCardArt";
import "../../../../adeeva/ui/screens/label/planner.css";

export interface ShowcasePlannerProps {
  readonly state: GameState;
  readonly season: SeasonDef;
  readonly dispatch: (action: Action) => boolean;
  readonly onStaged: () => void;
  readonly onExit: () => void;
}

const LIGHT_WORDS: Readonly<Record<RunwayLightId, string>> = {
  warm: "Golden fairy-light glow, like late afternoon.",
  cool: "Moonlit blues that make colours sing.",
  spotlight: "One bright beam on each piece.",
};

function role(position: number, count: number): string {
  if (count === 1) return "The whole show";
  if (position === 0) return "Opener";
  if (position === count - 1) return "Closer";
  return "Middle";
}

function moved(order: readonly string[], from: number, to: number): string[] {
  const next = [...order];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
}

export function ShowcasePlanner({ state, season, dispatch, onStaged, onExit }: ShowcasePlannerProps) {
  const shelf = shelfPieces(state);
  const tip = hallTip(state);
  const [order, setOrder] = useState<readonly string[]>(() => shelf.map((piece) => piece.id));
  const [mood, setMood] = useState<MusicMoodId | null>(null);
  const [light, setLight] = useState<RunwayLightId | null>(null);
  const [leaving, setLeaving] = useState(false);
  const painted = useAfterFirstPaint();
  const audienceId = useSvgId("tf-planner-audience");
  const [cards, setCards] = useState<Readonly<Record<string, string>>>(() =>
    Object.fromEntries(shelf.map((piece) => [piece.id, storyCardsFor(piece)[0]?.id ?? "fresh"])),
  );
  const kept = order.flatMap((id) => shelf.filter((piece) => piece.id === id));
  const synced = kept.length === shelf.length ? order : shelf.map((piece) => piece.id);
  const ordered = synced.flatMap((id) => shelf.filter((piece) => piece.id === id));
  const chosen = Object.fromEntries(
    ordered.map((piece) => [piece.id, cards[piece.id] ?? storyCardsFor(piece)[0]?.id ?? "fresh"]),
  );
  const plan: ShowcasePlan | null =
    mood === null || light === null ? null : { order: synced, mood, light, cards: chosen };
  const issues = plan === null ? ["Pick the music and the lights."] : showcaseIssues(state, plan);
  const palette = season.palette.map((id) => colourById(id).hex);
  const late = isLateShowcaseDay(state) && state.profile.difficulty !== "relaxed";
  const suggested = suggestedShelf(state);
  const changed =
    mood !== null ||
    light !== null ||
    synced.some((id, position) => shelf[position]?.id !== id) ||
    ordered.some((piece) => chosen[piece.id] !== (storyCardsFor(piece)[0]?.id ?? "fresh"));

  const stage = () => {
    if (plan !== null && dispatch({ type: "stageShowcase", ...plan })) onStaged();
  };

  return (
    <main className="tf-planner ad-screen" data-testid="showcase-planner">
      <div className="tf-planner__scene">
        <HallBackdrop
          banner={season.banner}
          palette={palette}
          light={light ?? "warm"}
          crop="top"
          title={`Larkspur Hall ready for ${season.banner}`}
          audienceId={audienceId}
        />
      </div>
      <header className="tf-planner__head">
        <Button
          variant="secondary"
          icon="back"
          onClick={() => (changed ? setLeaving(true) : onExit())}
          data-testid="planner-back"
        >
          Back to the shop
        </Button>
        <div>
          <span className="ad-eyebrow">The Upcycle Showcase · {season.name}</span>
          <h1>&ldquo;{season.banner}&rdquo;</h1>
        </div>
        <StatChip kind="day" value={state.calendar.day} />
      </header>
      {late ? (
        <p className="tf-planner__late" role="status">
          <Icon name="clock" size={18} /> Today is the last Showcase day. A show today scores 10 less.
        </p>
      ) : null}
      {shelf.length === 0 ? (
        <section className="tf-planner__empty">
          <h2>Your show shelf is empty</h2>
          <p className="ad-muted">{HINTS.shelf}</p>
          {suggested.length > 0 ? (
            <Button icon="sparkle" onClick={() => dispatch({ type: "fillShelf" })} data-testid="planner-fill">
              Add {suggested.length} pieces from this season
            </Button>
          ) : (
            <p>Make a piece this season, then come back to the hall.</p>
          )}
        </section>
      ) : (
        <>
          <section className="tf-planner__section" aria-label="Walking order">
            <h2>1 · Walking order</h2>
            <p className="tf-hint">
              <Icon name="hanger" size={18} />
              {HINTS.walk}
            </p>
            <ol className="tf-walk">
              {ordered.map((piece, position) => (
                <li key={piece.id} className="tf-walk__row" data-testid={`walk-${piece.id}`}>
                  <span className="tf-walk__number">{position + 1}</span>
                  <ProductPreview
                    design={piece.design}
                    cloth={pieceCloth(piece.id, piece.cloth)}
                    finishes={piece.finishes}
                    title={recipeById(piece.recipeId).name}
                    className="tf-walk__art"
                  />
                  <span className="tf-walk__name">
                    <strong>{recipeById(piece.recipeId).name}</strong>
                    <small>
                      {role(position, ordered.length)} · quality {piece.quality}
                    </small>
                  </span>
                  <span className="tf-walk__moves">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={position === 0}
                      onClick={() => setOrder(moved(synced, position, position - 1))}
                      aria-label={`Walk the ${recipeById(piece.recipeId).name} earlier`}
                    >
                      ↑ Earlier
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={position === ordered.length - 1}
                      onClick={() => setOrder(moved(synced, position, position + 1))}
                      aria-label={`Walk the ${recipeById(piece.recipeId).name} later`}
                    >
                      ↓ Later
                    </Button>
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <section className="tf-planner__section" aria-label="Story cards">
            <h2>2 · A story card for each piece</h2>
            <div className="tf-planner__cards">
              {ordered.map((piece) => (
                <div
                  key={piece.id}
                  className="tf-planner__card-set"
                  role="radiogroup"
                  aria-label={`Story for the ${recipeById(piece.recipeId).name}`}
                >
                  {storyCardsFor(piece).map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      role="radio"
                      aria-checked={chosen[piece.id] === card.id}
                      className={chosen[piece.id] === card.id ? "tf-card-choice is-chosen" : "tf-card-choice"}
                      onClick={() => setCards((current) => ({ ...current, [piece.id]: card.id }))}
                      data-testid={`card-${piece.id}-${card.id}`}
                    >
                      <StoryCardArt piece={piece} card={card} />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </section>
          <section className="tf-planner__section tf-planner__section--stage" aria-label="Music">
            <h2>3 · Music</h2>
            <MoodPicker theme={season} value={mood} onChange={setMood} whisper={tip !== null} />
          </section>
          <section className="tf-planner__section tf-planner__section--stage" aria-label="Lights">
            <h2>4 · Lights</h2>
            <LightPicker
              value={light}
              onChange={setLight}
              copy={LIGHT_WORDS}
              renderPreview={(id) =>
                painted ? (
                  <HallBackdrop
                    banner={season.banner}
                    palette={palette}
                    light={id}
                    className="ad-rw-choice__stage"
                    audienceOf={audienceId}
                  />
                ) : (
                  <span className="ad-rw-choice__stage tf-planner__preview-wait" aria-hidden="true" />
                )
              }
            />
          </section>
          {tip !== null ? (
            <p className="tf-season__tip" data-testid="hall-tip">
              Hall tip: this season loves {MUSIC_MOODS.find((entry) => entry.id === tip.mood)?.name} with{" "}
              {RUNWAY_LIGHTS.find((entry) => entry.id === tip.light)?.name}.
            </p>
          ) : null}
        </>
      )}
      <footer className="tf-planner__foot">
        <span className="ad-muted" aria-live="polite">
          {shelf.length === 0 ? HINTS.shelf : (issues[0] ?? "Ready! The hall is filling up.")}
        </span>
        <Button
          size="lg"
          icon="sparkle"
          onClick={stage}
          disabledReason={issues[0]}
          data-testid="stage-showcase"
        >
          Stage the show
        </Button>
      </footer>
      <LeaveDraftDialog
        open={leaving}
        title="Leave the Showcase plan?"
        detail="Your music, lights and story cards aren't saved until you stage the show."
        stayLabel="Keep planning"
        onStay={() => setLeaving(false)}
        onLeave={onExit}
      />
    </main>
  );
}
