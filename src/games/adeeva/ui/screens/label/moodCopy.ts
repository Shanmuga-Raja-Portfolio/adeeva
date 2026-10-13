import type { RunwayLightId } from "../../../content/runwayLight";
import type { RunwayMoodId } from "../../../content/runwayMood";

export const MOOD_COPY: Record<RunwayMoodId, string> = {
  "dreamy-strings": "Soft violins and a slow, glowing swell.",
  "beach-pop": "Bright guitar, hand claps and a sunny beat.",
  "synth-pulse": "Deep bass and shimmering electric synths.",
  "classic-jazz": "Brushed drums and a warm late-night piano.",
};

export const LIGHT_COPY: Record<RunwayLightId, string> = {
  warm: "Golden and flattering, like late afternoon.",
  cool: "Moonlit blues that make colours glow.",
  spotlight: "One fierce beam, all eyes on the look.",
};
