export function sameFields<T extends object>(stored: T | undefined, next: T): boolean {
  if (stored === undefined) return false;
  const keys = Object.keys(next) as (keyof T)[];
  return Object.keys(stored).length === keys.length && keys.every((key) => stored[key] === next[key]);
}
