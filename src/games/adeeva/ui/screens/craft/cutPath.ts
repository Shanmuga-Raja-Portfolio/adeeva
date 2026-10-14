import { pointOnTrack, type TraceTrack } from "../../../../../engine/geometry/traceTrack";

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
