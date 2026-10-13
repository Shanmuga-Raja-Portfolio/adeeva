import type { CSSProperties } from "react";
import { useEffect, useMemo } from "react";
import { RUNWAY_MOODS } from "../../../content/runwayMood";
import type { ShowThemeDef } from "../../../content/showTheme";
import {
  colourById,
  type GameState,
  type LabelSeason,
  type RunwayChoice,
  type RunwayResult,
} from "../../../core";
import { useSettings } from "../../../app/SettingsContext";
import { window01 } from "./easing";
import { MusicChip } from "./MusicChip";
import { showCast } from "./showCast";
import { ShowFrame } from "./ShowFrame";
import {
  momentAt,
  sceneLabel,
  showDuration,
  showSegments,
  STILL_FADE_MS,
  type ShowMoment,
} from "./showTimeline";
import { themeAccent } from "./themeAccent";
import { useShowClock } from "./useShowClock";
import "./show.css";

export interface RunwayShowProps {
  state: GameState;
  season: LabelSeason;
  theme: ShowThemeDef;
  runway: RunwayChoice;
  result: RunwayResult;
  onDone: () => void;
}

export function RunwayShow({ state, season, theme, runway, result, onDone }: RunwayShowProps) {
  const { reducedMotion } = useSettings();
  const cast = useMemo(() => showCast(season, runway.order), [season, runway.order]);
  const segments = useMemo(() => showSegments(cast.length, reducedMotion), [cast.length, reducedMotion]);
  const elapsed = useShowClock(showDuration(segments), onDone);
  const moment = momentAt(segments, elapsed);
  const audience = result.panels.find((panel) => panel.id === "audience")?.score ?? 50;
  const accent = themeAccent(theme);
  const petals = useMemo(
    () => [...theme.palette.map((colour) => colourById(colour).hex), "#fff6ee", "#f2c4c9"],
    [theme.palette],
  );
  const moodName = RUNWAY_MOODS.find((mood) => mood.id === runway.mood)?.name ?? "Music";

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDone();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDone]);

  const frames: { moment: ShowMoment; opacity: number }[] = [{ moment, opacity: 1 }];
  const following = segments[moment.index + 1];
  if (reducedMotion && following !== undefined) {
    const fade = window01(moment.ms, moment.segment.durationMs - STILL_FADE_MS, moment.segment.durationMs);
    if (fade > 0)
      frames.push({ moment: { segment: following, index: moment.index + 1, t: 0, ms: 0 }, opacity: fade });
  }
  const pips = segments.filter((segment) => segment.kind !== "title" && segment.kind !== "lights");
  const activePip = pips.indexOf(moment.segment);

  return (
    <div
      className="ad-show"
      role="region"
      aria-label={`${theme.name} runway show`}
      data-testid="runway-show"
      data-scene={sceneLabel(moment.segment)}
      style={{ "--show-glow": accent.glow, "--show-accent": accent.accent } as CSSProperties}
    >
      <div className="ad-show__screen">
        {frames.map((frame) => (
          <ShowFrame
            key={frame.moment.index}
            moment={frame.moment}
            cast={cast}
            light={runway.light}
            venue={season.venue}
            seasonNumber={season.number}
            themeName={theme.name}
            designerName={state.profile.name}
            designerLook={state.profile.look}
            audience={audience}
            hearts={accent.heart}
            petalColours={petals}
            still={reducedMotion}
            opacity={frame.opacity}
          />
        ))}
      </div>
      <div className="ad-show__hud">
        <MusicChip name={moodName} elapsed={elapsed} playing={!reducedMotion} />
        <ol className="ad-show__pips" aria-label="Show progress">
          {pips.map((segment, index) => (
            <li
              key={sceneLabel(segment)}
              className={index === activePip ? "is-active" : index < activePip ? "is-done" : ""}
            >
              <span className="ad-visually-hidden">{sceneLabel(segment)}</span>
            </li>
          ))}
        </ol>
        <button type="button" className="ad-show__skip" onClick={onDone}>
          Skip to the reviews ›
        </button>
      </div>
    </div>
  );
}
