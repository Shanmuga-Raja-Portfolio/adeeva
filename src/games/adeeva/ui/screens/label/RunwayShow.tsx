import { type CSSProperties, useMemo } from "react";
import { MUSIC_MOODS } from "../../../../../engine/musicMood";
import type { ShowThemeDef } from "../../../content/showTheme";
import {
  colourById,
  type GameState,
  type LabelSeason,
  type RunwayChoice,
  type RunwayResult,
} from "../../../core";
import { useSettings } from "../../../../../studio/SettingsContext";
import { showCast } from "./showCast";
import { ShowFrame } from "./ShowFrame";
import { ShowHud } from "./ShowHud";
import { sceneLabel } from "../../../../../ui/show/showTimeline";
import { themeAccent } from "./themeAccent";
import { useShowPlayback } from "../../../../../ui/show/useShowPlayback";
import "../../../../../ui/show/show.css";
import "./runwayShow.css";

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
  const { segments, elapsed, moment, frames } = useShowPlayback(cast.length, reducedMotion, onDone);
  const audience = result.panels.find((panel) => panel.id === "audience")?.score ?? 50;
  const accent = themeAccent(theme);
  const petals = useMemo(
    () => [...theme.palette.map((colour) => colourById(colour).hex), "#fff6ee", "#f2c4c9"],
    [theme.palette],
  );
  const moodName = MUSIC_MOODS.find((mood) => mood.id === runway.mood)?.name ?? "Music";

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
      <ShowHud
        segments={segments}
        moment={moment}
        elapsed={elapsed}
        moodName={moodName}
        playing={!reducedMotion}
        skipLabel="Skip to the reviews ›"
        onSkip={onDone}
      />
    </div>
  );
}
