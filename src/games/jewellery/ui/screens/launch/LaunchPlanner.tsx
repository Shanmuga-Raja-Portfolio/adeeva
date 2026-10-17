import { MUSIC_MOODS, type MusicMoodId } from "../../../../../engine/musicMood";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { LANTERN_COLOURS, type LanternColourId } from "../../../content/lanternColour";
import { LAUNCH_MUSIC_WORDS } from "../../../content/launchMusic";
import type { LaunchThemeDef } from "../../../content/launchTheme";
import { MENTOR_LOOK } from "../../../content/mentor";
import { lanternById, productById, type CollectionState } from "../../../core";
import { PiecePreview } from "../../art/PiecePreview";
import { themeWords } from "../loft/themeWords";
import { RadioCards } from "./RadioCards";

export interface PlanDraft {
  readonly order: readonly string[];
  readonly lantern: LanternColourId | null;
  readonly music: MusicMoodId | null;
  readonly card: number | null;
}

export interface LaunchPlannerProps {
  readonly collection: CollectionState;
  readonly theme: LaunchThemeDef;
  readonly draft: PlanDraft;
  readonly relaxed: boolean;
  readonly latePenalty: number | null;
  readonly stageIssue: string | null;
  readonly onDraft: (draft: PlanDraft) => void;
  readonly onBack: () => void;
  readonly onStage: () => void;
}

function swapped(order: readonly string[], at: number, step: number): string[] {
  const next = [...order];
  const here = next[at];
  const there = next[at + step];
  if (here === undefined || there === undefined) return next;
  next[at] = there;
  next[at + step] = here;
  return next;
}

export function LaunchPlanner({
  collection,
  theme,
  draft,
  relaxed,
  latePenalty,
  stageIssue,
  onDraft,
  onBack,
  onStage,
}: LaunchPlannerProps) {
  const words = themeWords(theme);
  return (
    <section className="jb-launch-plan" data-testid="launch-planner" aria-labelledby="jb-launch-plan-title">
      <header className="jb-launch-board__head">
        <div>
          <span className="ad-eyebrow">The Planner</span>
          <h2 id="jb-launch-plan-title">Plan your Lantern Night</h2>
          <p className="jb-muted">
            {theme.name} feels <strong>{words[0]}</strong>, <strong>{words[1]}</strong> and{" "}
            <strong>{words[2]}</strong>.
          </p>
        </div>
        <Button variant="ghost" icon="back" onClick={onBack}>
          Back to the board
        </Button>
      </header>
      <p className="jb-launch-plan__osei" role="note">
        <Avatar look={MENTOR_LOOK} size={44} title="Mr. Osei" frameColour="#d9e9ea" />
        <span>
          {relaxed
            ? `Osei suggests… ${lanternById(theme.lantern).name.toLowerCase()} lanterns, the ${LAUNCH_MUSIC_WORDS[theme.music]} music, the best story card and your finest piece last. Tap Light the lanterns when you're happy!`
            : "Match the lanterns and the music to the mood words. Read the cards, then choose who comes last."}
        </span>
      </p>
      <div className="jb-launch-plan__grid">
        <div className="jb-launch-plan__order">
          <h3>Reveal order</h3>
          <p className="jb-hint">Save your favourite for last!</p>
          <ol>
            {draft.order.map((pieceId, at) => {
              const piece = collection.pieces.find((entry) => entry.id === pieceId);
              if (piece === undefined) return null;
              const name = productById(piece.look.productId).name;
              return (
                <li key={pieceId} className="jb-reveal-row" data-testid={`reveal-row-${at}`}>
                  <span className="jb-reveal-row__number">{at + 1}</span>
                  <PiecePreview source={piece.look} title={null} className="jb-reveal-row__art" />
                  <span className="jb-reveal-row__name">
                    <strong>{name}</strong>
                    <span className="jb-muted">Quality {piece.quality}</span>
                  </span>
                  <span className="jb-reveal-row__moves">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onDraft({ ...draft, order: swapped(draft.order, at, -1) })}
                      disabled={at === 0}
                      aria-label={`Show ${name} earlier`}
                    >
                      ▲
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onDraft({ ...draft, order: swapped(draft.order, at, 1) })}
                      disabled={at === draft.order.length - 1}
                      aria-label={`Show ${name} later`}
                    >
                      ▼
                    </Button>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="jb-launch-plan__choices">
          <h3>Lantern colour</h3>
          <RadioCards<LanternColourId>
            label="Lantern colour"
            value={draft.lantern}
            onChange={(lantern) => onDraft({ ...draft, lantern })}
            cards={LANTERN_COLOURS.map((lantern) => ({
              value: lantern.id,
              title: lantern.name,
              sub: lantern.word,
              swatch: lantern.hex,
              testId: `lantern-${lantern.id}`,
            }))}
          />
          <h3>Music</h3>
          <RadioCards<MusicMoodId>
            label="Music"
            value={draft.music}
            onChange={(music) => onDraft({ ...draft, music })}
            cards={MUSIC_MOODS.map((music) => ({
              value: music.id,
              title: `♪ ${music.name}`,
              sub: LAUNCH_MUSIC_WORDS[music.id],
              testId: `music-${music.id}`,
            }))}
          />
          <h3>Story card</h3>
          <RadioCards<string>
            label="Story card"
            wide
            value={draft.card === null ? null : String(draft.card)}
            onChange={(card) => onDraft({ ...draft, card: Number(card) })}
            cards={theme.cards.map((text, index) => ({
              value: String(index),
              title: `“${text}”`,
              testId: `story-card-${index}`,
            }))}
          />
        </div>
      </div>
      <footer className="jb-launch-board__foot">
        {latePenalty !== null ? (
          <p className="jb-hint">
            A late Launch today takes 4 hours
            {latePenalty > 0 ? `, and the panels count ${latePenalty} fewer points` : ""}.
          </p>
        ) : null}
        <Button
          size="lg"
          icon="sparkle"
          onClick={onStage}
          disabledReason={stageIssue ?? undefined}
          showReason
          data-testid="stage-launch"
        >
          Light the lanterns
        </Button>
      </footer>
    </section>
  );
}
