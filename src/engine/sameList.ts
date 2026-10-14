const identical = <T>(x: T, y: T): boolean => x === y;

export function sameList<T>(
  a: readonly T[],
  b: readonly T[],
  same: (x: T, y: T) => boolean = identical,
): boolean {
  return (
    a.length === b.length &&
    a.every((entry, index) => {
      const other = b[index];
      return other !== undefined && same(entry, other);
    })
  );
}
