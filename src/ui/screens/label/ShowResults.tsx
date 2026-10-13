import type { ShowThemeDef } from "../../../content/showTheme";
import { starsForScore, type GameState, type LabelSeason, type RunwayResult } from "../../../core";
import { useSettings } from "../../../app/SettingsContext";
import { StarRating } from "../../kit/StarRating";
import { BoardTopBar } from "./BoardTopBar";
import { NextSeasonPicker } from "./NextSeasonPicker";
import { PanelCard } from "./PanelCard";
import { PressClipping } from "./PressClipping";
import { RewardsCard } from "./RewardsCard";
import { useCountUp } from "../../kit/useCountUp";
import "./results.css";

export interface ShowResultsProps {
  state: GameState;
  season: LabelSeason;
  theme: ShowThemeDef;
  result: RunwayResult;
  onBoard: () => void;
  onReplay: () => void;
  onExit: () => void;
  onNextSeason: (themeId: string) => void;
}

function headline(overall: number): string {
  if (overall >= 85) return "A standing ovation";
  if (overall >= 70) return "The room is buzzing";
  if (overall >= 50) return "A show to be proud of";
  if (overall >= 30) return "A brave first step";
  return "Every great label starts somewhere";
}

export function ShowResults({
  state,
  season,
  theme,
  result,
  onBoard,
  onReplay,
  onExit,
  onNextSeason,
}: ShowResultsProps) {
  const { reducedMotion } = useSettings();
  const overall = useCountUp(result.overall, 1400, 200, reducedMotion);
  const ring = 2 * Math.PI * 52;
  return (
    <div className="ad-reviews-screen ad-screen" data-testid="show-results">
      <BoardTopBar state={state} title="Show reviews" backLabel="Collection board" onBack={onBoard} />
      <main className="ad-reviews__main">
        <header className="ad-reviews__hero">
          <div className="ad-reviews__ring" aria-label={`Overall ${result.overall} out of 100`} role="img">
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="52" className="ad-reviews__ring-track" />
              <circle
                cx="60"
                cy="60"
                r="52"
                className="ad-reviews__ring-fill"
                strokeDasharray={`${(ring * overall) / 100} ${ring}`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <span className="ad-reviews__overall">{overall}</span>
            <span className="ad-reviews__overall-label">overall</span>
          </div>
          <div className="ad-reviews__copy">
            <span className="ad-reviews__eyebrow">
              {theme.name} · {season.venue}
            </span>
            <h1>{headline(result.overall)}</h1>
            <StarRating stars={starsForScore(result.overall)} size={22} />
            <button type="button" className="ad-reviews__replay" onClick={onReplay}>
              ↺ Watch the show again
            </button>
          </div>
        </header>
        <section className="ad-reviews__panels" aria-label="Panel scores">
          {result.panels.map((panel, index) => (
            <PanelCard key={panel.id} panel={panel} order={index} instant={reducedMotion} />
          ))}
        </section>
        <div className="ad-reviews__press">
          <PressClipping
            quote={result.pressQuote}
            themeName={theme.name}
            venue={season.venue}
            designer={state.profile.name}
            seasonNumber={season.number}
            day={state.calendar.day}
          />
          <RewardsCard result={result} coinsNow={state.coins} instant={reducedMotion} />
        </div>
        <NextSeasonPicker
          state={state}
          nextNumber={season.number + 1}
          onStart={onNextSeason}
          onExit={onExit}
        />
      </main>
    </div>
  );
}
