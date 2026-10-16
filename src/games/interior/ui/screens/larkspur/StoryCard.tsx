import type { ReactNode } from "react";
import type { HomeStoryDef } from "../../../content/homeStory";
import { TOUR_MUSIC } from "../../../content/tourMusic";
import { TOUR_TIMES } from "../../../content/tourTime";
import { decorById } from "../../../core";
import { DecorArt } from "../../art/DecorArt";
import { roomHex } from "../../art/roomHex";
import "./larkspur.css";

interface StoryCardProps {
  readonly story: HomeStoryDef;
  readonly compact?: boolean | undefined;
  readonly children?: ReactNode;
}

function storyMoodWords(story: HomeStoryDef): readonly [string, string] {
  const music = TOUR_MUSIC.find((entry) => entry.id === story.bestMusic)?.word ?? "";
  const time = TOUR_TIMES.find((entry) => entry.id === story.bestTime)?.word ?? "";
  return [music, time];
}

export function StoryCard({ story, compact = false, children }: StoryCardProps) {
  const [music, time] = storyMoodWords(story);
  return (
    <article
      className={compact ? "is-story-card is-story-card--compact" : "is-story-card"}
      data-testid={`story-${story.id}`}
    >
      <header className="is-story-card__head">
        <span className="ad-eyebrow">The family's story</span>
        <h3>{story.name}</h3>
      </header>
      <p className="is-story-card__blurb">{story.blurb}</p>
      <div className="is-story-card__palette" aria-label="Story colours">
        {story.palette.map((colour) => (
          <span
            key={colour}
            className="is-story-card__swatch"
            style={{ background: roomHex(colour) }}
            title={colour}
          />
        ))}
      </div>
      <ul className="is-story-card__pieces" aria-label="Story pieces">
        {story.pieces.map((piece) => (
          <li key={piece.decorId}>
            <svg viewBox="-36 -36 72 72" width={44} height={44} aria-hidden="true">
              <DecorArt decorId={piece.decorId} soft={roomHex("coral")} />
            </svg>
            <span>{decorById(piece.decorId).name}</span>
          </li>
        ))}
      </ul>
      <p className="is-story-card__words">
        <span>Feels</span>
        <strong>{music}</strong>
        <span>and</span>
        <strong>{time}</strong>
        <span>· {story.tags.join(" + ")}</span>
      </p>
      {children}
    </article>
  );
}
