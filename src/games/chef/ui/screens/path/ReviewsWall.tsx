import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { criticById, type RestaurantState } from "../../../core";
import { SpoonRating } from "./SpoonRating";

export function ReviewsWall({ restaurant }: { readonly restaurant: RestaurantState }) {
  const reviews = [...restaurant.reviews].reverse();
  const notes = [...restaurant.notes].reverse();
  return (
    <section className="ck-panel ck-reviews" aria-labelledby="ck-reviews-title" data-testid="reviews-wall">
      <header className="ck-panel__header">
        <h2 id="ck-reviews-title">Reviews wall</h2>
        <span className="ck-muted">Critics visit once in each two weeks</span>
      </header>
      {reviews.length === 0 ? (
        <p className="ck-muted">No reviews yet. Keep the rims clean and the plates warm!</p>
      ) : (
        <ul className="ck-reviews__list">
          {reviews.map((review) => {
            const critic = criticById(review.criticId);
            return (
              <li key={`${review.criticId}-${review.day}`} className="ck-review">
                <Avatar look={critic.look} size={48} title={critic.name} frameColour="#fbe6c2" />
                <div>
                  <strong>{critic.name}</strong> <span className="ck-muted">· {critic.outlet}</span>
                  <SpoonRating spoons={review.spoons} />
                  {review.lines.map((line) => (
                    <p key={line} className="ck-review__line">
                      {line}
                    </p>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {notes.length > 0 ? (
        <>
          <h3 className="ck-reviews__notes-title">Kind guest notes</h3>
          <ul className="ck-notes">
            {notes.map((note, index) => (
              <li key={`${note}-${index}`} className="ck-note">
                {note}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
