import type { QualityBreakdown } from "../../../core";

interface QualityRow {
  readonly label: string;
  readonly value: number;
  readonly praise: string;
}

function word(value: number, great: string, good: string): string {
  if (value >= 0.85) return great;
  if (value >= 0.6) return good;
  return "keep practising";
}

export function qualityRows(quality: QualityBreakdown): QualityRow[] {
  const rows: QualityRow[] = [
    { label: "Cut out", value: quality.cut, praise: word(quality.cut, "crisp!", "neat") },
    { label: "Joins", value: quality.join, praise: word(quality.join, "smooth!", "steady") },
  ];
  if (quality.hasStones)
    rows.push({ label: "Stones", value: quality.set, praise: word(quality.set, "snug!", "secure") });
  rows.push({ label: "Polish", value: quality.polish, praise: word(quality.polish, "sparkling!", "shiny") });
  rows.push({
    label: "Metal choice",
    value: quality.metalFit,
    praise: quality.metalFit === 1 ? "just right!" : "not their pick",
  });
  return rows;
}
