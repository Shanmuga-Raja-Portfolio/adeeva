import type { Point } from "../../../../../../engine/geometry/point";

const traced = new Map<string, readonly Point[]>();

export function ghostKey(runId: string, partId: string, cut: number): string {
  return `${runId}|${partId}|${cut}`;
}

export function rememberCut(key: string, samples: readonly Point[]): void {
  traced.set(key, samples);
}

export function tracedCut(key: string): readonly Point[] | null {
  return traced.get(key) ?? null;
}
