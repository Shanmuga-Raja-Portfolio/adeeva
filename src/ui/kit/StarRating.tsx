import { Icon } from "./IconSet";
import "./StarRating.css";

export interface StarRatingProps {
  stars: number;
  max?: number | undefined;
  size?: number | undefined;
}

export function StarRating({ stars, max = 5, size = 14 }: StarRatingProps) {
  return (
    <span className="ad-stars" role="img" aria-label={`${stars} of ${max} stars`}>
      {Array.from({ length: max }, (_, index) => (
        <span key={index} className={index < stars ? "ad-stars__on" : "ad-stars__off"}>
          <Icon name="star" size={size} />
        </span>
      ))}
    </span>
  );
}
