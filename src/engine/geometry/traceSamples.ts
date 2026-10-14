import type { Point } from "./point";

export function samplesFit(samples: readonly Point[], maxSamples: number): boolean {
  return (
    samples.length > 0 &&
    samples.length <= maxSamples &&
    samples.every((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]))
  );
}

export function fitSamples(samples: readonly Point[], maxSamples: number): readonly Point[] {
  if (samples.length <= maxSamples) return samples;
  const step = Math.ceil(samples.length / (maxSamples - 1));
  return samples.filter((_, index) => index % step === 0 || index === samples.length - 1);
}
