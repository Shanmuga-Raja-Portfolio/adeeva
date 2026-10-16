const SEPARATOR = ":";

export function setPartId(piece: number, partId: string): string {
  return `${piece}${SEPARATOR}${partId}`;
}
