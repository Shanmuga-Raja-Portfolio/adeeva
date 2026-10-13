let seedCounter = 0;

export function newSeed(): number {
  seedCounter += 1;
  const entropy = new Uint32Array(1);
  crypto.getRandomValues(entropy);
  const clock = Math.floor(performance.now() * 1000);
  return ((entropy[0] ?? 0) ^ clock ^ Math.imul(seedCounter, 2654435761)) | 0;
}
