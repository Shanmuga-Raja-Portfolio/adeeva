import { StarRating } from "../../../../../ui/kit/StarRating";
import type { RibbonId } from "../../../content/ribbon";
import { clientById, productById, ribbonById, type BakeBookEntry } from "../../../core";
import { BakePreview } from "../../art/BakePreview";
import { bookEntryLook } from "../../art/bakeLook";
import { Rosette } from "../../art/Rosette";

export interface BakeBookCardProps {
  readonly entry: BakeBookEntry;
  readonly ribbon?: RibbonId | undefined;
  readonly large?: boolean | undefined;
}

export function bakeBookLine(entry: BakeBookEntry, ribbon: RibbonId | undefined): string {
  const client = clientById(entry.clientId);
  if (client === undefined)
    return ribbon === undefined ? "Waiting under a cloth for Fair Day." : ribbonById(ribbon).line;
  return entry.happy ? client.lines.delighted : client.lines.nearMiss;
}

export function bakeBookOwner(entry: BakeBookEntry): string {
  return clientById(entry.clientId)?.name ?? "Fair showpiece";
}

export function BakeBookCard({ entry, ribbon, large = false }: BakeBookCardProps) {
  const look = bookEntryLook(entry);
  const owner = bakeBookOwner(entry);
  return (
    <figure className={large ? "pa-book-card pa-book-card--large" : "pa-book-card"}>
      {look !== null ? (
        <BakePreview look={look} title={`${productById(entry.productId).name} for ${owner}`} />
      ) : null}
      {ribbon !== undefined ? (
        <span className="pa-book-card__ribbon" data-testid="book-ribbon">
          <Rosette ribbon={ribbon} size={large ? 72 : 48} title={ribbonById(ribbon).name} />
        </span>
      ) : null}
      <figcaption>
        <strong>{owner}</strong>
        <span className="pa-muted">
          Day {entry.day} · {productById(entry.productId).name}
        </span>
        <StarRating stars={entry.stars} size={large ? 22 : 16} />
        {large ? <blockquote>“{bakeBookLine(entry, ribbon)}”</blockquote> : null}
      </figcaption>
    </figure>
  );
}
