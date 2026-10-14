import { Icon } from "../../../../../ui/kit/IconSet";
import { RECIPES } from "../../../content/recipe";
import {
  partById,
  partChoiceIssue,
  recipeById,
  recipeChoiceIssue,
  recipeOpen,
  type Design,
} from "../../../core";
import { PLAN_CLOTH } from "../../art/planCloth";
import { ProductPreview } from "../../art/ProductPreview";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";

function sampleDesign(recipeId: Design["recipeId"]): Design {
  if (recipeId === null) return { recipeId, parts: {} };
  const parts = Object.fromEntries(
    recipeById(recipeId).partGroups.flatMap((group) => {
      const first = group.partIds[0];
      return first === undefined ? [] : [[group.id, first]];
    }),
  );
  return { recipeId, parts };
}

export function DesignStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const recipe = run.design.recipeId === null ? null : recipeById(run.design.recipeId);
  return (
    <div className="tf-design">
      <div className="tf-design__main">
        <div className="tf-design__recipes" role="radiogroup" aria-label="What to make">
          {RECIPES.filter((entry) => recipeOpen(state, entry.id)).map((entry) => {
            const issue = recipeChoiceIssue(state, run, entry.id);
            const selected = run.design.recipeId === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-disabled={issue !== null}
                title={issue ?? undefined}
                className={[
                  "tf-recipe",
                  selected ? "tf-recipe--selected" : "",
                  issue !== null ? "tf-recipe--locked" : "",
                ]
                  .filter((name) => name.length > 0)
                  .join(" ")}
                onClick={() => {
                  if (issue === null) dispatch({ type: "chooseRecipe", recipeId: entry.id });
                }}
                data-recipe={entry.id}
              >
                <ProductPreview
                  design={sampleDesign(entry.id)}
                  cloth={PLAN_CLOTH[entry.id]}
                  title={entry.name}
                  className="tf-recipe__art"
                />
                <strong className="tf-recipe__name">{entry.name}</strong>
                <span className="tf-recipe__blurb">{entry.blurb}</span>
                <span className="tf-recipe__meta">
                  <Icon name="coin" size={14} /> Worth about {entry.baseValue}
                </span>
                {issue !== null ? <span className="tf-recipe__lock">{issue}</span> : null}
              </button>
            );
          })}
        </div>
        {recipe !== null && recipe.partGroups.length > 0 ? (
          <div className="tf-design__parts">
            {recipe.partGroups.map((group) => (
              <fieldset key={group.id} className="tf-parts">
                <legend>{group.label}</legend>
                <div className="tf-parts__options" role="radiogroup" aria-label={group.label}>
                  {group.partIds.map((partId) => {
                    const issue = partChoiceIssue(run, group.id, partId);
                    const selected = run.design.parts[group.id] === partId;
                    return (
                      <button
                        key={partId}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-disabled={issue !== null}
                        title={issue ?? undefined}
                        className={selected ? "tf-part tf-part--selected" : "tf-part"}
                        onClick={() => {
                          if (issue === null) dispatch({ type: "choosePart", groupId: group.id, partId });
                        }}
                      >
                        {partById(partId)?.name ?? partId}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        ) : null}
      </div>
      <aside className="tf-design__preview" aria-label="Your plan">
        <ProductPreview
          design={run.design}
          cloth={recipe === null ? null : PLAN_CLOTH[recipe.id]}
          title={recipe === null ? "Pick something to make" : `${recipe.name} plan`}
          className="tf-design__art"
        />
        <p className="ad-muted">
          {recipe === null
            ? "Pick something to make. You'll choose the finds next."
            : `${recipe.name}: ${recipe.blurb}`}
        </p>
      </aside>
      <StageFooter {...props} hint="Lovely plan! Next, find something to remake." />
    </div>
  );
}
