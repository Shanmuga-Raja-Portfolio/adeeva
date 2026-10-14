import type { ChapterId } from "../../../content/chapter";
import type { DishId } from "../../../content/dish";
import { cardFor, chapterById, dishById, ghostLayout, STEP_STATIONS, type GameState } from "../../../core";
import { PlateArt } from "../../art/PlateArt";
import { StationIcon } from "../../art/StationIcon";

export interface RecipeCardProps {
  readonly state: GameState;
  readonly chapterId: ChapterId;
  readonly dishId: DishId;
  readonly tip: number;
  readonly size?: "full" | "mini" | undefined;
}

export function RecipeCard({ state, chapterId, dishId, tip, size = "full" }: RecipeCardProps) {
  const dish = dishById(dishId);
  const chapter = chapterById(chapterId);
  const card = cardFor(state.platingCards, dishId);
  return (
    <figure
      className={`ck-recipe ck-recipe--${size}`}
      style={{ ["--ck-chapter" as string]: chapter.colour }}
      data-testid={`recipe-${dishId}`}
    >
      <figcaption className="ck-recipe__banner">{dish.name}</figcaption>
      <PlateArt
        colour={card?.plateColour ?? "white"}
        components={card?.components ?? ghostLayout(dish)}
        title={`${dish.name}, plated`}
        className="ck-recipe__plate"
      />
      <ol className="ck-recipe__steps" aria-label="Steps">
        <li className="ck-recipe__ready" aria-label="Get ready" />
        {dish.steps.map((step, index) => (
          <li key={`${step.kind}-${index}`} aria-label={step.kind}>
            <StationIcon station={STEP_STATIONS[step.kind]} />
          </li>
        ))}
      </ol>
      {size === "full" ? <p className="ck-recipe__tip">{chapter.tips[tip]}</p> : null}
      <p className="ck-recipe__badge">Cook with an adult</p>
    </figure>
  );
}
