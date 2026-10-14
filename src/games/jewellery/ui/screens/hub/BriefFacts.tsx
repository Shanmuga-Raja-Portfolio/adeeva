import { Icon } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { jewelColourById, type JewelColour } from "../../../content/jewelColour";
import type { JewelTag } from "../../../content/jewelTag";
import { extraById, metalById, productById, type Brief } from "../../../core";
import { MiniIcon } from "../../art/MiniIcon";

export interface BriefFactsProps {
  readonly brief: Brief;
  readonly hotTags: readonly JewelTag[];
}

function Swatches({ colours }: { readonly colours: readonly JewelColour[] }) {
  return (
    <span className="jb-facts__swatches">
      {colours.map((colour) => {
        const def = jewelColourById(colour);
        return (
          <span key={colour} className="jb-facts__swatch" title={def.name}>
            <span className="jb-facts__dot" style={{ background: def.hex }} />
            {def.name}
          </span>
        );
      })}
    </span>
  );
}

export function BriefFacts({ brief, hotTags }: BriefFactsProps) {
  const product = productById(brief.productId);
  return (
    <dl className="jb-facts">
      <div>
        <dt>Piece</dt>
        <dd>
          <MiniIcon name="gem" /> {product.name}
          {product.seats.length > 0
            ? ` · ${product.seats.length} ${product.seats.length === 1 ? "stone" : "stones"}`
            : ""}
        </dd>
      </div>
      <div>
        <dt>Feels</dt>
        <dd className="jb-facts__tags">
          {brief.requiredTags.map((tag) => (
            <TagPill key={tag} tone={hotTags.includes(tag) ? "hot" : "plain"}>
              {tag}
            </TagPill>
          ))}
        </dd>
      </div>
      <div>
        <dt>Loves</dt>
        <dd>
          <Swatches colours={brief.favouredColours} />
        </dd>
      </div>
      {brief.avoidColours.length > 0 || brief.avoidMetals.length > 0 ? (
        <div>
          <dt>Please avoid</dt>
          <dd>
            {brief.avoidColours.length > 0 ? <Swatches colours={brief.avoidColours} /> : null}
            {brief.avoidMetals.map((id) => metalById(id).name).join(", ")}
          </dd>
        </div>
      ) : null}
      {brief.requiredExtras.length > 0 ? (
        <div>
          <dt>Must have</dt>
          <dd>
            {brief.requiredExtras
              .map((requirement) => `${requirement.count} × ${extraById(requirement.extraId).name}`)
              .join(", ")}
          </dd>
        </div>
      ) : null}
      <div className="jb-facts__numbers">
        <span>
          <Icon name="coin" size={15} /> Budget {brief.budget}
        </span>
        <span>
          <Icon name="coin" size={15} /> Pays up to {brief.fee}
        </span>
        <span>
          <Icon name="calendar" size={15} /> Due day {brief.deadlineDay}
        </span>
        <span>
          <Icon name="star" size={15} /> Quality {brief.minQuality}+
        </span>
      </div>
    </dl>
  );
}
