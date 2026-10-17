import { Icon } from "../../../../../ui/kit/IconSet";
import { findById, recipeById, type RackPiece, type StoryCard } from "../../../core";
import { FindArt } from "../../art/FindArt";
import { pieceCloth } from "../../art/findCloth";
import { ProductPreview } from "../../art/ProductPreview";

export interface StoryCardArtProps {
  readonly piece: RackPiece;
  readonly card: StoryCard;
  readonly className?: string | undefined;
}

export function StoryCardArt({ piece, card, className }: StoryCardArtProps) {
  const name = recipeById(piece.recipeId).name;
  return (
    <figure className={className ? `tf-story-card ${className}` : "tf-story-card"}>
      <div className="tf-story-card__pair">
        {card.findId === null ? (
          <span className="tf-story-card__fresh" aria-hidden="true">
            <Icon name="sparkle" size={34} />
          </span>
        ) : (
          <FindArt
            find={findById(card.findId)}
            grade="tired"
            size={110}
            title={`${findById(card.findId).name}, as it was found`}
          />
        )}
        <span className="tf-story-card__arrow" aria-hidden="true">
          →
        </span>
        <ProductPreview
          design={piece.design}
          cloth={pieceCloth(piece.id, piece.cloth)}
          finishes={piece.finishes}
          title={name}
          className="tf-story-card__piece"
        />
      </div>
      <figcaption>
        <strong>{name}</strong>
        <span>{card.line}</span>
      </figcaption>
    </figure>
  );
}
