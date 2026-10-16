import { window01 } from "../kit/easing";

export type ShowSceneKind = "title" | "lights" | "walk" | "finale" | "bow";

export interface ShowSegment {
  readonly kind: ShowSceneKind;
  readonly walk: number;
  readonly durationMs: number;
}

export interface ShowMoment {
  readonly segment: ShowSegment;
  readonly index: number;
  readonly t: number;
  readonly ms: number;
}

const MOTION_MS: Record<ShowSceneKind, number> = {
  title: 3400,
  lights: 1900,
  walk: 5800,
  finale: 6400,
  bow: 5200,
};

const STILL_MS: Record<ShowSceneKind, number> = {
  title: 2800,
  lights: 0,
  walk: 3200,
  finale: 3200,
  bow: 3200,
};

export const STILL_FADE_MS = 700;

export function showSegments(walks: number, reduced: boolean): ShowSegment[] {
  const timing = reduced ? STILL_MS : MOTION_MS;
  const segment = (kind: ShowSceneKind, walk = -1): ShowSegment => ({
    kind,
    walk,
    durationMs: timing[kind],
  });
  return [
    segment("title"),
    ...(reduced ? [] : [segment("lights")]),
    ...Array.from({ length: walks }, (_, walk) => segment("walk", walk)),
    segment("finale"),
    segment("bow"),
  ];
}

export function showDuration(segments: readonly ShowSegment[]): number {
  return segments.reduce((sum, segment) => sum + segment.durationMs, 0);
}

export function momentAt(segments: readonly ShowSegment[], elapsed: number): ShowMoment {
  let start = 0;
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    if (segment === undefined) break;
    const end = start + segment.durationMs;
    if (elapsed < end || index === segments.length - 1) {
      const ms = Math.min(segment.durationMs, Math.max(0, elapsed - start));
      return { segment, index, t: segment.durationMs === 0 ? 1 : ms / segment.durationMs, ms };
    }
    start = end;
  }
  const fallback: ShowSegment = { kind: "bow", walk: -1, durationMs: 1 };
  return { segment: fallback, index: 0, t: 1, ms: 1 };
}

export function sceneLabel(segment: ShowSegment): string {
  if (segment.kind === "walk") return `walk-${segment.walk + 1}`;
  return segment.kind;
}

export interface ShowFrameSlot {
  readonly moment: ShowMoment;
  readonly opacity: number;
}

export function crossfadeFrames(
  segments: readonly ShowSegment[],
  moment: ShowMoment,
  still: boolean,
): ShowFrameSlot[] {
  const frames: ShowFrameSlot[] = [{ moment, opacity: 1 }];
  const following = segments[moment.index + 1];
  if (!still || following === undefined) return frames;
  const fade = window01(moment.ms, moment.segment.durationMs - STILL_FADE_MS, moment.segment.durationMs);
  if (fade > 0)
    frames.push({ moment: { segment: following, index: moment.index + 1, t: 0, ms: 0 }, opacity: fade });
  return frames;
}

export function progressPips(segments: readonly ShowSegment[]): ShowSegment[] {
  return segments.filter((segment) => segment.kind !== "title" && segment.kind !== "lights");
}
