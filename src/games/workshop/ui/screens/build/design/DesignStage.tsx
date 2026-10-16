import { Icon } from "../../../../../../ui/kit/IconSet";
import { productById, shadeById, woodById } from "../../../../core";
import { PiecePreview } from "../../../art/PiecePreview";
import { pieceLook } from "../../../art/pieceLook";
import { SetDesign } from "../set/SetDesign";
import { StageFooter } from "../StageFooter";
import type { StageProps } from "../stageProps";
import { SlotChoices, WoodChoices } from "./DesignChoices";
import "./design.css";

export function DesignStage(props: StageProps) {
  const { state, run, dispatch } = props;
  if (run.purpose.kind === "set") return <SetDesign {...props} />;
  const { productId, woodId } = run.design;
  const product = productId === null ? null : productById(productId);
  const look = pieceLook(run);
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
          {product !== null ? <SlotChoices run={run} slots={product.slots} dispatch={dispatch} /> : null}
          {product !== null ? <WoodChoices state={state} run={run} dispatch={dispatch} /> : null}
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
