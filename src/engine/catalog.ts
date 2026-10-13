export function requireById<T extends { readonly id: string }>(
  items: readonly T[],
  id: string,
  kind: string,
): T {
  const found = items.find((item) => item.id === id);
  if (found === undefined) throw new Error(`Missing ${kind} in catalog: ${id}`);
  return found;
}
