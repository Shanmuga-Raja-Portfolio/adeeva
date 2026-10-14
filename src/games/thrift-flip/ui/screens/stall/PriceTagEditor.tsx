import { useId } from "react";
import { Icon } from "../../../../../ui/kit/IconSet";
import { MAX_TAG_PRICE, recipeById, type FairBand, type RackPiece } from "../../../core";
import { pieceCloth } from "../../art/findCloth";
import { LeafMeter } from "../../art/LeafMeter";
import { PriceTag } from "../../art/PriceTag";
import { ProductPreview } from "../../art/ProductPreview";

export interface PriceTagEditorProps {
  readonly piece: RackPiece;
  readonly band: FairBand;
  readonly price: number;
  readonly tilt: number;
  readonly onPrice: (price: number) => void;
  readonly bonuses?: readonly string[] | undefined;
}

export function sliderMax(band: FairBand): number {
  return Math.min(MAX_TAG_PRICE, Math.max(10, band.value * 2));
}

export function PriceTagEditor({ piece, band, price, tilt, onPrice, bonuses = [] }: PriceTagEditorProps) {
  const sliderId = useId();
  const name = recipeById(piece.recipeId).name;
  const max = sliderMax(band);
  const set = (value: number) => onPrice(Math.min(max, Math.max(1, Math.round(value))));
  const inBand = price >= band.low && price <= band.high;
  return (
    <article className="tf-price" data-testid="price-tag" data-piece={piece.id}>
      <div className="tf-price__hanger">
        <ProductPreview
          design={piece.design}
          cloth={pieceCloth(piece.id, piece.cloth)}
          finishes={piece.finishes}
          title={name}
          className="tf-price__art"
        />
      </div>
      <PriceTag tilt={tilt} tone={inBand ? "mint" : "kraft"}>
        <div className="tf-price__body">
          <strong className="tf-price__name">{name}</strong>
          {bonuses.length > 0 ? (
            <span className="tf-price__bonuses">
              {bonuses.map((bonus) => (
                <span key={bonus} className="tf-sale__bonus">
                  ×1.1 {bonus}
                </span>
              ))}
            </span>
          ) : null}
          <span className="tf-price__meta">
            Quality {piece.quality} · <LeafMeter leaves={piece.leaves} size={14} />
          </span>
          <label htmlFor={sliderId} className="tf-price__value">
            <Icon name="coin" size={22} />
            <span data-testid="price-value">{price}</span>
          </label>
          <div className="tf-price__controls">
            <button
              type="button"
              className="tf-price__step"
              onClick={() => set(price - 1)}
              aria-label={`One coin less for the ${name}`}
            >
              −1
            </button>
            <input
              id={sliderId}
              className="tf-price__slider"
              type="range"
              min={1}
              max={max}
              step={1}
              value={price}
              aria-label={`Price for the ${name}`}
              onChange={(event) => set(Number(event.target.value))}
            />
            <button
              type="button"
              className="tf-price__step"
              onClick={() => set(price + 1)}
              aria-label={`One coin more for the ${name}`}
            >
              +1
            </button>
          </div>
          <span className="tf-price__guide">
            Pieces like this go for {band.low}–{band.high}.
          </span>
        </div>
      </PriceTag>
    </article>
  );
}
