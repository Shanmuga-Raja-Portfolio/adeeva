import { dressGarment } from "../../art/avatarDress";
import type { RunwayLightId } from "../../../content/runwayLight";
import { RUNWAY_MOODS, type RunwayMoodId } from "../../../content/runwayMood";
import { AvatarFigure } from "../../../../../ui/art/avatar/Avatar";
import { RunwayStage } from "../../art/RunwayStage";
import type { ShowWalker } from "./showCast";
import { useLoopClock } from "./useLoopClock";
import { walkProgress } from "./walkProgress";

export interface StagePreviewProps {
  cast: readonly ShowWalker[];
  light: RunwayLightId | null;
  mood: RunwayMoodId | null;
  venue: string;
  reducedMotion: boolean;
}

const WALK_MS = 4600;

export function StagePreview({ cast, light, mood, venue, reducedMotion }: StagePreviewProps) {
  const count = Math.max(1, cast.length);
  const phase = useLoopClock(WALK_MS * count, !reducedMotion);
  const slot = Math.min(count - 1, Math.floor(phase * count));
  const local = phase * count - slot;
  const walker = cast[reducedMotion ? cast.length - 1 : slot];
  const progress = reducedMotion ? 0.5 : walkProgress(local);
  const fade = reducedMotion ? 1 : Math.min(1, local / 0.06, (1 - local) / 0.08);
  const moodName = RUNWAY_MOODS.find((entry) => entry.id === mood)?.name;
  return (
    <figure
      className={light === null ? "ad-stage-preview is-unlit" : "ad-stage-preview"}
      data-testid="stage-preview"
    >
      <RunwayStage
        light={light ?? "warm"}
        progress={progress}
        venue={venue}
        flashes={false}
        className="ad-stage-preview__stage"
        title={`Preview of the runway at ${venue}`}
      >
        {walker !== undefined ? (
          <g opacity={Math.max(0, fade)}>
            <AvatarFigure look={walker.model} garment={dressGarment(walker.dress)} mood="neutral" />
          </g>
        ) : null}
      </RunwayStage>
      <figcaption className="ad-stage-preview__caption">
        {walker !== undefined ? (
          <span>
            {walker.role} · Look {walker.lookIndex + 1}
          </span>
        ) : null}
        <span>{moodName !== undefined ? `♪ ${moodName}` : "♪ No music yet"}</span>
      </figcaption>
      {light === null ? (
        <span className="ad-stage-preview__hint">Pick the lights to see the stage glow</span>
      ) : null}
    </figure>
  );
}
