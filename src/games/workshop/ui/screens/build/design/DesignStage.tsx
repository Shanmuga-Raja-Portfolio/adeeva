import { Icon } from "../../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../../ui/kit/TagPill";
import { HINTS } from "../../../../content/hint";
import { PART_OPTIONS, SLOT_NAMES } from "../../../../content/partOption";
import { hammersFor, WOODS } from "../../../../content/wood";
import { boardPrice, productById, shadeById, woodById, woodLockReason } from "../../../../core";
import { HammerIcons } from "../../../art/HammerIcons";
import { PiecePreview } from "../../../art/PiecePreview";
import { pieceLook } from "../../../art/pieceLook";
import { woodLook } from "../../../art/woodLook";
import { StageFooter } from "../StageFooter";
import type { StageProps } from "../stageProps";
import "./design.css";

export function DesignStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const { productId, options, woodId } = run.design;
  const product = productId === null ? null : productById(productId);
  const look = pieceLook(run);
  const avoided = woodId !== null && run.brief.avoidWoods.includes(woodId);
  return (
    <div className="ww-design">
      <div className="ww-design__grid">
        <div className="ww-design__choices">
          <section aria-labelledby="ww-design-product">
            <h2 id="ww-design-product" className="ww-design__heading">
              What to make
            </h2>
            <div className="ww-design__products" role="radiogroup" aria-label="What to make">
              {run.brief.products.map((id) => {
                const entry = productById(id);
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={productId === id}
                    className="ww-design__product"
                    onClick={() => dispatch({ type: "chooseProduct", productId: id })}
                  >
                    <strong>{entry.name}</strong>
                    <span className="ww-muted">{entry.blurb}</span>
                  </button>
                );
              })}
            </div>
          </section>
          {product?.slots.map((slot) => (
            <section key={slot} aria-labelledby={`ww-design-${slot}`}>
              <h2 id={`ww-design-${slot}`} className="ww-design__heading">
                {SLOT_NAMES[slot]}
              </h2>
              <div className="ww-design__chips" role="radiogroup" aria-label={SLOT_NAMES[slot]}>
                {PART_OPTIONS.filter((option) => option.slot === slot).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={options[slot] === option.id}
                    className="ww-design__chip"
                    onClick={() => dispatch({ type: "chooseOption", slot, optionId: option.id })}
                  >
                    <strong>{option.name}</strong>
                    <span className="ww-design__chip-note">{option.sawNote}</span>
                    <span className="ww-design__tags">
                      {option.tags.map((tag) => (
                        <TagPill key={tag} tone={run.brief.requiredTags.includes(tag) ? "sage" : "plain"}>
                          {tag}
                        </TagPill>
                      ))}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
          {product !== null ? (
            <section aria-labelledby="ww-design-wood">
              <h2 id="ww-design-wood" className="ww-design__heading">
                Wood
              </h2>
              <div className="ww-design__woods" role="radiogroup" aria-label="Wood">
                {WOODS.map((wood) => {
                  const lock = woodLockReason(state, wood.id);
                  const colours = woodLook(wood.id);
                  return (
                    <button
                      key={wood.id}
                      type="button"
                      role="radio"
                      aria-checked={woodId === wood.id}
                      aria-label={`${wood.name}${lock === null ? "" : `, locked. ${lock}`}`}
                      className="ww-design__wood"
                      disabled={lock !== null}
                      title={lock ?? undefined}
                      onClick={() => dispatch({ type: "chooseWood", woodId: wood.id })}
                      data-testid={`wood-${wood.id}`}
                    >
                      <span
                        className="ww-design__wood-swatch"
                        style={{
                          background: `repeating-linear-gradient(176deg, ${colours.base} 0 7px, ${colours.line} 7px 8px, ${colours.base} 8px 13px, ${colours.light} 13px 15px)`,
                        }}
                        aria-hidden="true"
                      >
                        {lock !== null ? <Icon name="lock" size={18} /> : null}
                      </span>
                      <strong>{wood.name}</strong>
                      <span className="ww-design__wood-meta">
                        <span className="ww-coin-line">
                          <Icon name="coin" size={14} /> {boardPrice(state, wood.id, "long")}
                        </span>
                        <HammerIcons count={hammersFor(wood)} />
                      </span>
                      <span className="ww-design__wood-tags">{wood.tags.join(" · ")}</span>
                    </button>
                  );
                })}
              </div>
              {avoided ? (
                <p className="ww-design__warn" role="status">
                  <Icon name="lock" size={16} /> {HINTS.avoidedWood}
                </p>
              ) : null}
            </section>
          ) : null}
        </div>
        <aside className="ww-design__preview ww-paper">
          <span className="ad-eyebrow">Front view</span>
          {look !== null ? (
            <PiecePreview look={look} title={`Your ${product?.name ?? "piece"}`} className="ww-design__art" />
          ) : (
            <p className="ww-muted ww-design__empty">Pick what to make to see a sketch.</p>
          )}
          {woodId !== null ? (
            <p className="ww-hint">
              <Icon name="star" size={16} /> {woodById(woodId).name} shows as{" "}
              {shadeById(woodById(woodId).tone).name.toLowerCase()} under a clear finish.
            </p>
          ) : null}
        </aside>
      </div>
      <StageFooter {...props} ready="Lovely plan! Off to the timber yard." />
    </div>
  );
}
