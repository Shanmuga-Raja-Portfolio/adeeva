import type { CSSProperties } from "react";
import { easeOut, window01 } from "./easing";

export interface ShowTitleCardProps {
  t: number;
  seasonNumber: number;
  themeName: string;
  venue: string;
  designer: string;
  still: boolean;
}

const NUMBER_WORDS = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

function line(t: number, start: number, still: boolean): CSSProperties {
  if (still) return { opacity: 1 };
  const enter = easeOut(window01(t, start, start + 0.2));
  const exit = window01(t, 0.86, 1);
  return {
    opacity: enter * (1 - exit),
    transform: `translateY(${((1 - enter) * 18).toFixed(1)}px)`,
  };
}

export function ShowTitleCard({ t, seasonNumber, themeName, venue, designer, still }: ShowTitleCardProps) {
  const season = NUMBER_WORDS[seasonNumber - 1] ?? String(seasonNumber);
  const rule = still ? 1 : easeOut(window01(t, 0.3, 0.6)) * (1 - window01(t, 0.86, 1));
  return (
    <div className="ad-show-title" data-testid="show-title">
      <span className="ad-show-title__eyebrow" style={line(t, 0.04, still)}>
        Season {season}
      </span>
      <h1 className="ad-show-title__name" style={line(t, 0.14, still)}>
        {themeName}
      </h1>
      <span className="ad-show-title__rule" style={{ transform: `scaleX(${rule.toFixed(3)})` }} />
      <span className="ad-show-title__venue" style={line(t, 0.34, still)}>
        live at {venue}
      </span>
      <span className="ad-show-title__by" style={line(t, 0.5, still)}>
        A collection by {designer}
      </span>
    </div>
  );
}
