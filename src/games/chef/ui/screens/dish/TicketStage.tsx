import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Icon } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { CAREER } from "../../../content/career";
import {
  clientById,
  cookSteps,
  cuisineById,
  dishById,
  ingredientById,
  mentorFor,
  type DishRun,
  type GameState,
} from "../../../core";
import { chefWhites } from "../../art/chefWhites";
import { IngredientIcon } from "../../art/IngredientIcon";
import { KitchenBackdrop } from "../../art/KitchenBackdrop";
import { COOK_STEP_NAMES } from "./stageNames";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";

function Host({ state, run }: { readonly state: GameState; readonly run: DishRun }) {
  const dish = dishById(run.dishId);
  const cuisine = cuisineById(dish.cuisine);
  if (run.purpose.kind === "lesson") {
    const mentor = mentorFor(run.purpose.cuisine);
    return (
      <div className="ck-host">
        <Avatar
          look={mentor.look}
          garment={chefWhites(cuisine.accent)}
          size={96}
          title={mentor.name}
          frameColour={cuisine.wall}
        />
        <div className="ck-host__bubble">
          <strong>{mentor.name}</strong>
          <p>“{mentor.firstLine}”</p>
          <span className="ck-muted">
            Teaches: {mentor.teaches} Today's value: {mentor.value.toLowerCase()}.
          </span>
        </div>
      </div>
    );
  }
  if (run.purpose.kind === "order") {
    const gigId = run.purpose.gigId;
    const client = clientById(state.gigs.active.find((gig) => gig.id === gigId)?.clientId ?? "");
    if (client === undefined) return null;
    return (
      <div className="ck-host">
        <Avatar look={client.look} size={96} title={client.name} frameColour="#f2d9a8" />
        <div className="ck-host__bubble">
          <strong>{client.name}</strong>
          <p>“{client.lines.request}”</p>
          {client.avoidNote === null ? null : <span className="ck-muted">{client.avoidNote}</span>}
        </div>
      </div>
    );
  }
  return (
    <div className="ck-host ck-host--plain">
      <Icon name="star" size={28} />
      <p>
        {run.purpose.kind === "test"
          ? `${run.purpose.test === "graduation" ? "Graduation Practical" : "Tasting Day"}: dish ${run.purpose.index + 1} of 3. You've got this.`
          : run.purpose.kind === "segment"
            ? "Spoon & Story is live: cook it with your cue cards."
            : "Practice kitchen: no pay, no pressure. Just cooking."}
      </p>
    </div>
  );
}

export function TicketStage(props: StageProps) {
  const { state, run } = props;
  const dish = dishById(run.dishId);
  const cuisine = cuisineById(dish.cuisine);
  return (
    <div className="ck-ticket-stage">
      <div className="ck-ticket-stage__scene">
        <KitchenBackdrop scene="counter" cuisine={dish.cuisine} className="ck-ticket-stage__backdrop" />
        <article className="ck-paper-ticket" style={{ ["--ck-cuisine" as string]: cuisine.accent }}>
          <div className="ck-paper-ticket__clip" aria-hidden="true" />
          <p className="ck-paper-ticket__adult" data-testid="adult-badge">
            <Icon name="heart" size={16} /> Cook with an adult
          </p>
          <span className="ad-eyebrow">{cuisine.counter}</span>
          <h2 className="ck-paper-ticket__name">{dish.name}</h2>
          <p className="ck-paper-ticket__region">{dish.region}</p>
          <p>{dish.blurb}</p>
          <div className="ck-paper-ticket__tags">
            {dish.tags.map((tag) => (
              <TagPill key={tag} tone={state.trends.current.includes(tag) ? "hot" : "plain"}>
                {tag}
              </TagPill>
            ))}
          </div>
          <ul className="ck-paper-ticket__ingredients" aria-label="Ingredients">
            {dish.ingredients.map((id) => (
              <li key={id}>
                <IngredientIcon ingredientId={id} size={40} />
                <span>{ingredientById(id).name}</span>
              </li>
            ))}
          </ul>
          <ol className="ck-paper-ticket__steps">
            {cookSteps(dish).map((kind) => (
              <li key={kind}>{COOK_STEP_NAMES[kind]}</li>
            ))}
            <li>
              Plate with {dish.plate.garnishCount} {dish.plate.garnishCount === 1 ? "garnish" : "garnishes"}
            </li>
          </ol>
          {dish.sizzle !== null ? (
            <p className="ck-paper-ticket__heat">
              Heat: {"●".repeat(dish.sizzle.idealDots)}
              {"○".repeat(5 - dish.sizzle.idealDots)}
            </p>
          ) : null}
          <p className="ck-muted">
            <Icon name="clock" size={14} />{" "}
            {run.purpose.kind === "test" ? CAREER.testDishHours : CAREER.dishHours} hours, already on the
            clock
          </p>
        </article>
      </div>
      <Host state={state} run={run} />
      <StageFooter {...props} />
    </div>
  );
}
