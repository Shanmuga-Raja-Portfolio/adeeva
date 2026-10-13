import { COLOURS } from "../../../../../engine/palette";
import { Icon } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { FILLINGS } from "../../../content/filling";
import { PIPE_PATTERNS, PATTERN_CHOICES } from "../../../content/pipePattern";
import {
  batchName,
  maxColours,
  mixOptions,
  productById,
  productOptions,
  type BakeDesign,
} from "../../../core";
import { BakePreview } from "../../art/BakePreview";
import { bakeLook } from "../../art/bakeLook";
import { HeatDots } from "../../art/HeatDots";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import "./design.css";

function sampleDesign(design: BakeDesign, productId: BakeDesign["productId"]): BakeDesign {
  if (productId === null) return design;
  const product = productById(productId);
  const mix = mixOptions(product)[0]?.id ?? null;
  return {
    productId,
    mixIds: Array.from({ length: product.batches }, () => mix),
    fillingId: null,
    colours: design.colours.length > 0 ? design.colours : ["ivory", "sky"],
    pattern: "a",
  };
}

export function DesignStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const { design } = run;
  const brief = run.brief;
  const product = design.productId === null ? null : productById(design.productId);
  const hot = state.trends.current;
  const soon = state.profile.trait === "trendsetter" ? state.trends.next : [];
  const limit = maxColours(run);
  const look = bakeLook(design, [], true);
  return (
    <div className="pa-design">
      <div className="pa-design__builder">
        <section className="pa-design__section" aria-labelledby="pa-design-products">
          <h2 id="pa-design-products">1. What will you bake?</h2>
          <div className="pa-design__products" role="radiogroup" aria-label="Bake">
            {productOptions(run).map((id) => {
              const thumb = bakeLook(sampleDesign(design, id), [], true);
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={design.productId === id}
                  className="pa-choice pa-choice--product"
                  onClick={() => dispatch({ type: "chooseProduct", productId: id })}
                >
                  {thumb !== null ? (
                    <BakePreview look={thumb} title={null} className="pa-choice__thumb" />
                  ) : null}
                  <strong>{productById(id).name}</strong>
                </button>
              );
            })}
          </div>
        </section>
        {product !== null ? (
          <section className="pa-design__section" aria-labelledby="pa-design-mix">
            <h2 id="pa-design-mix">2. Choose the mix</h2>
            {design.mixIds.map((selected, batch) => (
              <div key={batch} className="pa-design__batch">
                {product.batches > 1 ? <h3>{batchName(product, batch)}</h3> : null}
                <div
                  className="pa-design__mixes"
                  role="radiogroup"
                  aria-label={`${batchName(product, batch)} mix`}
                >
                  {mixOptions(product).map((mix) => (
                    <button
                      key={mix.id}
                      type="button"
                      role="radio"
                      aria-checked={selected === mix.id}
                      className="pa-choice pa-choice--mix"
                      onClick={() => dispatch({ type: "chooseMix", batch, mixId: mix.id })}
                    >
                      <span
                        className="pa-choice__blob"
                        style={{ background: mix.colour }}
                        aria-hidden="true"
                      />
                      <strong>{mix.name}</strong>
                      <span className="pa-choice__tags">
                        {mix.tags.map((tag) => (
                          <TagPill
                            key={tag}
                            tone={hot.includes(tag) ? "hot" : soon.includes(tag) ? "next" : "plain"}
                          >
                            {tag}
                          </TagPill>
                        ))}
                      </span>
                      <HeatDots heat={mix.idealHeat} />
                      <span className="pa-choice__meta">
                        <Icon name="clock" size={14} /> {mix.minutes} min
                      </span>
                      {brief !== null && brief.avoidMixes.includes(mix.id) ? (
                        <span className="pa-choice__warn">Not their favourite</span>
                      ) : null}
                      {brief !== null && brief.requiredMixes.includes(mix.id) ? (
                        <span className="pa-choice__love">Just what they asked for</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ) : null}
        {product !== null &&
        run.purpose.kind === "order" &&
        (product.filling.kind === "optional" || product.filling.kind === "required") ? (
          <section className="pa-design__section" aria-labelledby="pa-design-filling">
            <h2 id="pa-design-filling">3. Pick a filling</h2>
            <div className="pa-design__fillings" role="radiogroup" aria-label="Filling">
              {product.filling.kind === "optional" ? (
                <button
                  type="button"
                  role="radio"
                  aria-checked={design.fillingId === null}
                  className="pa-choice pa-choice--filling"
                  onClick={() => dispatch({ type: "chooseFilling", fillingId: null })}
                >
                  <strong>No filling</strong>
                </button>
              ) : null}
              {FILLINGS.map((filling) => (
                <button
                  key={filling.id}
                  type="button"
                  role="radio"
                  aria-checked={design.fillingId === filling.id}
                  className="pa-choice pa-choice--filling"
                  onClick={() => dispatch({ type: "chooseFilling", fillingId: filling.id })}
                >
                  <span
                    className="pa-choice__jar"
                    style={{ background: filling.colour }}
                    aria-hidden="true"
                  />
                  <strong>{filling.name}</strong>
                  <span className="pa-choice__meta">
                    <Icon name="coin" size={14} /> {filling.price} a jar
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}
        {product !== null ? (
          <section className="pa-design__section" aria-labelledby="pa-design-colours">
            <h2 id="pa-design-colours">
              {run.purpose.kind === "order" ? "4. Icing colours" : "3. Icing colour"}{" "}
              <span className="pa-muted">
                ({design.colours.length}/{limit})
              </span>
            </h2>
            <div className="pa-design__swatches" role="group" aria-label="Icing colours">
              {COLOURS.map((colour) => {
                const picked = design.colours.includes(colour.id);
                const loved = brief?.favouredColours.includes(colour.id) ?? false;
                const avoided = brief?.avoidColours.includes(colour.id) ?? false;
                return (
                  <button
                    key={colour.id}
                    type="button"
                    aria-pressed={picked}
                    aria-label={`${colour.name}${loved ? ", a favourite" : ""}${avoided ? ", not wanted" : ""}`}
                    title={colour.name}
                    className={[
                      "pa-swatch",
                      loved ? "pa-swatch--loved" : "",
                      avoided ? "pa-swatch--avoid" : "",
                    ].join(" ")}
                    style={{ background: colour.hex }}
                    onClick={() => dispatch({ type: "toggleColour", colour: colour.id })}
                  >
                    {picked ? (
                      <Icon name="check" size={16} />
                    ) : loved ? (
                      <Icon name="heart" size={14} />
                    ) : null}
                  </button>
                );
              })}
            </div>
            <p className="pa-hint">
              Hearts are their favourite colours. Each colour needs one pot of gel. Ivory is free.
            </p>
          </section>
        ) : null}
        {product !== null && run.purpose.kind === "order" ? (
          <section className="pa-design__section" aria-labelledby="pa-design-pattern">
            <h2 id="pa-design-pattern">5. Piping pattern</h2>
            <div className="pa-design__patterns" role="radiogroup" aria-label="Piping pattern">
              {PATTERN_CHOICES.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  role="radio"
                  aria-checked={design.pattern === choice}
                  className="pa-choice pa-choice--pattern"
                  onClick={() => dispatch({ type: "choosePattern", pattern: choice })}
                >
                  <strong>{PIPE_PATTERNS[product.id][choice].name}</strong>
                  <span className="pa-choice__meta">
                    {PIPE_PATTERNS[product.id][choice].paths.length} lines to pipe
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <div className="pa-design__preview">
        <div className="pa-design__stage">
          {look !== null ? (
            <BakePreview look={look} title="Your bake design" className="pa-design__art" />
          ) : (
            <p className="pa-muted pa-design__empty">Pick a bake to see it here.</p>
          )}
        </div>
      </div>
      <StageFooter {...props} ready="Looks delicious. Off to the pantry!" />
    </div>
  );
}
