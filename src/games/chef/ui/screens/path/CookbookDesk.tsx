import { Button } from "../../../../../ui/kit/Button";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { CARDS_PER_CHAPTER, type ChapterId } from "../../../content/chapter";
import { PATH_RULES } from "../../../content/career";
import {
  bookOfferIssue,
  chapterById,
  launchIssues,
  STRONG_STARS,
  type GameState,
  type TvState,
} from "../../../core";
import { RecipeCard } from "./RecipeCard";
import { SpoonRating } from "./SpoonRating";

export interface CookbookDeskProps {
  readonly state: GameState;
  readonly tv: TvState;
  readonly onSign: (event: ClickLike) => void;
  readonly onAddCard: (chapterId: ChapterId) => void;
  readonly onLaunch: (event: ClickLike) => void;
  readonly onService: () => void;
}

export function CookbookDesk({ state, tv, onSign, onAddCard, onLaunch, onService }: CookbookDeskProps) {
  const book = tv.book;
  return (
    <section className="ck-panel ck-cookbook" aria-labelledby="ck-cookbook-title" data-testid="cookbook-desk">
      <header className="ck-panel__header">
        <h2 id="ck-cookbook-title">The cookbook</h2>
        <span className="ck-muted">Icons only, never amounts. Every card says: cook with an adult.</span>
      </header>
      {book === null ? (
        <div className="ck-cookbook__offer">
          <p>
            After {PATH_RULES.bookOfferSegments} segments of {STRONG_STARS} stars or more, the Larkspur
            Library Press wants your book. You have {tv.strongSegments}.
          </p>
          <Button
            icon="star"
            onClick={onSign}
            disabledReason={bookOfferIssue(state) ?? undefined}
            data-testid="sign-book"
          >
            Sign the book deal (+{PATH_RULES.bookAdvance})
          </Button>
        </div>
      ) : (
        <>
          <ul className="ck-chapters">
            {book.chapters.map((chapter) => {
              const def = chapterById(chapter.chapterId);
              const full = chapter.cards.length >= CARDS_PER_CHAPTER;
              return (
                <li
                  key={chapter.chapterId}
                  className="ck-chapter"
                  style={{ ["--ck-chapter" as string]: def.colour }}
                >
                  <div className="ck-chapter__head">
                    <strong>{def.title}</strong>
                    <span className="ck-muted">
                      {chapter.cards.length} of {CARDS_PER_CHAPTER}
                    </span>
                  </div>
                  <div className="ck-chapter__cards">
                    {chapter.cards.map((card) => (
                      <RecipeCard
                        key={card.dishId}
                        state={state}
                        chapterId={chapter.chapterId}
                        dishId={card.dishId}
                        tip={card.tip}
                        size="mini"
                      />
                    ))}
                    {full || book.launched ? null : (
                      <button
                        type="button"
                        className="ck-chapter__add"
                        onClick={() => onAddCard(chapter.chapterId)}
                        data-testid={`add-card-${chapter.chapterId}`}
                      >
                        + Add a card
                      </button>
                    )}
                  </div>
                  {chapter.review === null || chapter.spoons === null ? null : (
                    <p className="ck-chapter__review">
                      <SpoonRating spoons={chapter.spoons} /> “{chapter.review}”
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
          {book.launched ? (
            <p className="ck-good">Launched! Your book is on the library shelf.</p>
          ) : state.service !== null ? (
            <Button icon="sparkle" onClick={onService} data-testid="back-to-service">
              Back to the launch
            </Button>
          ) : (
            <Button
              icon="sparkle"
              onClick={onLaunch}
              disabledReason={launchIssues(state)[0]}
              showReason
              data-testid="launch-book"
            >
              Launch the book at the library
            </Button>
          )}
        </>
      )}
    </section>
  );
}
