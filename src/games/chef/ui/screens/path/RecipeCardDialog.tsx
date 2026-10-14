import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import type { ChapterId } from "../../../content/chapter";
import { DISHES, type DishId } from "../../../content/dish";
import {
  chapterById,
  chapterFits,
  recipeCardIssue,
  STRONG_STARS,
  type GameState,
  type TvState,
} from "../../../core";
import { RecipeCard } from "./RecipeCard";

export interface RecipeCardDialogProps {
  readonly state: GameState;
  readonly tv: TvState;
  readonly chapterId: ChapterId | null;
  readonly onAdd: (chapterId: ChapterId, dishId: DishId, tip: number) => void;
  readonly onClose: () => void;
}

function Body({
  state,
  tv,
  chapterId,
  onAdd,
  onClose,
}: RecipeCardDialogProps & { readonly chapterId: ChapterId }) {
  const chapter = chapterById(chapterId);
  const current = tv.book?.chapters.find((entry) => entry.chapterId === chapterId);
  const options = DISHES.filter(
    (dish) => tv.tested.includes(dish.id) && current !== undefined && chapterFits(current, dish.id),
  );
  const [dishId, setDishId] = useState<DishId | null>(null);
  const [tip, setTip] = useState(0);
  const issue = dishId === null ? "Pick a tested dish." : recipeCardIssue(state, chapterId, dishId, tip);
  return (
    <Dialog
      open
      title={`A recipe card for ${chapter.title}`}
      onClose={onClose}
      className="ad-dialog--wide ck-recipe-dialog"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Not yet
          </Button>
          <Button
            icon="star"
            onClick={() => dishId !== null && onAdd(chapterId, dishId, tip)}
            disabledReason={issue ?? undefined}
            showReason
            data-testid="add-card"
          >
            Add to the book
          </Button>
        </>
      }
    >
      <p className="ck-dish-dialog__lead">
        {chapter.theme} Only dishes you cooked at {STRONG_STARS} stars or more can go in.
      </p>
      <div className="ck-recipe-dialog__body">
        <div className="ck-recipe-dialog__choices">
          <div className="ck-recipe-dialog__dishes" role="radiogroup" aria-label="Tested dishes">
            {options.length === 0 ? (
              <p className="ck-muted">No tested dish fits yet. Cook one at 4 stars, then come back.</p>
            ) : null}
            {options.map((dish) => (
              <button
                key={dish.id}
                type="button"
                role="radio"
                aria-checked={dishId === dish.id}
                className={dishId === dish.id ? "ck-name-card ck-name-card--on" : "ck-name-card"}
                disabled={recipeCardIssue(state, chapterId, dish.id, 0) !== null}
                onClick={() => setDishId(dish.id)}
                data-testid={`card-dish-${dish.id}`}
              >
                {dish.name}
              </button>
            ))}
          </div>
          <fieldset className="ck-cue__tip-set">
            <legend>Pick a tip bubble</legend>
            {chapter.tips.map((text, index) => (
              <label key={text} className={tip === index ? "ck-tip ck-tip--on" : "ck-tip"}>
                <input
                  type="radio"
                  name="recipe-tip"
                  checked={tip === index}
                  onChange={() => setTip(index)}
                />
                {text}
              </label>
            ))}
          </fieldset>
        </div>
        {dishId === null ? null : (
          <RecipeCard state={state} chapterId={chapterId} dishId={dishId} tip={tip} />
        )}
      </div>
    </Dialog>
  );
}

export function RecipeCardDialog(props: RecipeCardDialogProps) {
  return props.chapterId === null ? null : <Body {...props} chapterId={props.chapterId} />;
}
