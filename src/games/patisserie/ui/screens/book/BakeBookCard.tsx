import { StarRating } from "../../../../../ui/kit/StarRating";
import { clientById, productById, type BakeBookEntry } from "../../../core";
import { BakePreview } from "../../art/BakePreview";
import { bakeLook } from "../../art/bakeLook";

export interface BakeBookCardProps {
  readonly entry: BakeBookEntry;
  readonly large?: boolean | undefined;
}

export function bakeBookLine(entry: BakeBookEntry): string {
  const client = clientById(entry.clientId);
  if (client === undefined) return "";
  return entry.happy ? client.lines.delighted : client.lines.nearMiss;
}

export function BakeBookCard({ entry, large = false }: BakeBookCardProps) {
  const look = bakeLook(
    {
      productId: entry.productId,
      mixIds: entry.mixIds,
      fillingId: entry.fillingId,
      colours: entry.colours,
      pattern: entry.pattern,
    },
    entry.toppings,
    true,
  );
  const client = clientById(entry.clientId);
  return (
    <figure className={large ? "pa-book-card pa-book-card--large" : "pa-book-card"}>
      {look !== null ? (
        <BakePreview
          look={look}
          title={`${productById(entry.productId).name} for ${client?.name ?? "a neighbour"}`}
        />
      ) : null}
      <figcaption>
        <strong>{client?.name ?? "A neighbour"}</strong>
        <span className="pa-muted">
          Day {entry.day} · {productById(entry.productId).name}
        </span>
        <StarRating stars={entry.stars} size={large ? 22 : 16} />
        {large ? <blockquote>“{bakeBookLine(entry)}”</blockquote> : null}
      </figcaption>
    </figure>
  );
}
