export function walkRole(position: number, count: number): string {
  if (position === 0) return "Opener";
  if (position === count - 1) return "Closer";
  return "Middle walk";
}
