export interface PressClippingProps {
  quote: string;
  themeName: string;
  venue: string;
  designer: string;
  seasonNumber: number;
  day: number;
}

export function PressClipping({ quote, themeName, venue, designer, seasonNumber, day }: PressClippingProps) {
  return (
    <figure className="ad-clipping" data-testid="press-quote">
      <div className="ad-clipping__masthead">
        <span>The Hemline</span>
        <small>
          Style section · Day {day} · No. {seasonNumber}
        </small>
      </div>
      <h3 className="ad-clipping__headline">
        {designer} brings {themeName} to {venue}
      </h3>
      <blockquote className="ad-clipping__quote">
        <p>{quote}</p>
      </blockquote>
      <figcaption className="ad-clipping__byline">From our front-row fashion desk</figcaption>
      <div className="ad-clipping__columns" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
    </figure>
  );
}
