export function seasonDay(start: number, day: number, length: number): number | null {
  const offset = day - start;
  return offset >= 0 && offset < length ? offset + 1 : null;
}

export function nextSeasonStart(start: number, length: number): number {
  return start + length;
}
