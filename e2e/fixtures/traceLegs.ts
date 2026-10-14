export type TracePoint = readonly [number, number];

const TRACE_CHORD_SLACK_CM = 0.1;

function offChord(point: TracePoint, from: TracePoint, to: TracePoint): number {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy);
  if (length === 0) return Math.hypot(point[0] - from[0], point[1] - from[1]);
  return Math.abs(dx * (point[1] - from[1]) - dy * (point[0] - from[0])) / length;
}

export function traceLegs(route: readonly TracePoint[]): [TracePoint, TracePoint][] {
  const legs: [TracePoint, TracePoint][] = [];
  let anchor = 0;
  for (let end = 2; end <= route.length; end += 1) {
    const from = route[anchor];
    const to = route[end];
    const fits =
      from !== undefined &&
      to !== undefined &&
      route.slice(anchor + 1, end).every((point) => offChord(point, from, to) <= TRACE_CHORD_SLACK_CM);
    if (fits) continue;
    const kept = route[end - 1];
    if (from === undefined || kept === undefined) break;
    legs.push([from, kept]);
    anchor = end - 1;
  }
  return legs;
}
