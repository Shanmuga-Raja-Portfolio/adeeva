export function clientNames(
  ids: readonly string[],
  clientById: (id: string) => { readonly name: string } | undefined,
): string {
  return ids.map((id) => clientById(id)?.name ?? "A neighbour").join(", ");
}
