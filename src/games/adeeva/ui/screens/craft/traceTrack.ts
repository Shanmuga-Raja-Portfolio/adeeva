import type { Point } from "../../../../../engine/geometry/point";

interface TrackSegment {
  readonly start: Point;
  readonly end: Point;
  readonly length: number;
  readonly offset: number;
}

export interface TraceTrack {
  readonly segments: readonly TrackSegment[];
  readonly perimeter: number;
}

export interface TrackProjection {
  readonly along: number;
  readonly distance: number;
}

export function traceTrack(outline: readonly Point[]): TraceTrack {
  const segments: TrackSegment[] = [];
  let offset = 0;
  outline.forEach((start, index) => {
    const end = outline[(index + 1) % outline.length] ?? start;
    const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
    segments.push({ start, end, length, offset });
    offset += length;
  });
  return { segments, perimeter: offset };
}

export function projectOnTrack(track: TraceTrack, point: Point): TrackProjection {
  let best: TrackProjection = { along: 0, distance: Infinity };
  for (const segment of track.segments) {
    const dx = segment.end[0] - segment.start[0];
    const dy = segment.end[1] - segment.start[1];
    const squared = dx * dx + dy * dy;
    const t =
      squared === 0
        ? 0
        : Math.max(
            0,
            Math.min(1, ((point[0] - segment.start[0]) * dx + (point[1] - segment.start[1]) * dy) / squared),
          );
    const distance = Math.hypot(
      point[0] - (segment.start[0] + t * dx),
      point[1] - (segment.start[1] + t * dy),
    );
    if (distance < best.distance) best = { along: segment.offset + t * segment.length, distance };
  }
  return best;
}

function pointOnTrack(track: TraceTrack, along: number): Point {
  const wrapped = ((along % track.perimeter) + track.perimeter) % track.perimeter;
  const segment =
    track.segments.find((entry) => wrapped <= entry.offset + entry.length) ??
    track.segments[track.segments.length - 1];
  if (segment === undefined) return [0, 0];
  const t = segment.length === 0 ? 0 : (wrapped - segment.offset) / segment.length;
  return [
    segment.start[0] + t * (segment.end[0] - segment.start[0]),
    segment.start[1] + t * (segment.end[1] - segment.start[1]),
  ];
}

function binCount(track: TraceTrack): number {
  return Math.max(36, Math.round(track.perimeter / 1.5));
}

export function visitedBins(track: TraceTrack, samples: readonly Point[], reach: number): boolean[] {
  const bins = binCount(track);
  const visited: boolean[] = Array.from({ length: bins }, () => false);
  let previous: number | null = null;
  for (const sample of samples) {
    const projection = projectOnTrack(track, sample);
    if (projection.distance > reach) {
      previous = null;
      continue;
    }
    const bin = Math.min(bins - 1, Math.floor((projection.along / track.perimeter) * bins));
    visited[bin] = true;
    if (previous !== null) {
      const forward = (bin - previous + bins) % bins;
      const backward = (previous - bin + bins) % bins;
      const gap = Math.min(forward, backward);
      const direction = forward <= backward ? 1 : -1;
      if (gap > 1 && gap <= 4)
        for (let step = 1; step < gap; step += 1) visited[(previous + direction * step + bins) % bins] = true;
    }
    previous = bin;
  }
  return visited;
}

export function cutPath(track: TraceTrack, visited: readonly boolean[]): string {
  const bins = visited.length;
  const parts: string[] = [];
  visited.forEach((on, index) => {
    if (!on) return;
    const from = pointOnTrack(track, (index / bins) * track.perimeter);
    const to = pointOnTrack(track, ((index + 1) / bins) * track.perimeter);
    parts.push(`M${from[0].toFixed(2)} ${from[1].toFixed(2)} L${to[0].toFixed(2)} ${to[1].toFixed(2)}`);
  });
  return parts.join(" ");
}
