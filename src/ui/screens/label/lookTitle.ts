import { fabricById, partById, type FinishedLook } from "../../../core";

function partName(id: string | null): string | null {
  if (id === null) return null;
  return partById(id)?.name ?? null;
}

export function lookTitle(look: FinishedLook): string {
  const { fabrics } = look.snapshot.design;
  const lead = fabrics.skirt ?? fabrics.bodice;
  const name = lead === null ? undefined : fabricById(lead)?.name;
  return name ?? "Untitled look";
}

export function lookSilhouette(look: FinishedLook): string {
  const { parts } = look.snapshot.design;
  return [parts.bodice, parts.neckline, parts.sleeves, parts.skirt]
    .map(partName)
    .filter((name): name is string => name !== null && name !== "Sleeveless")
    .join(" · ");
}
