import { Icon } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { extraById, productById, shadeById, woodById, type Brief } from "../../../core";

export interface BriefFactsProps {
  readonly brief: Brief;
  readonly hotTags: readonly string[];
}

export function BriefFacts({ brief, hotTags }: BriefFactsProps) {
  return (
    <div className="ww-brief-facts">
      <div className="ww-brief-facts__row">
        <span className="ww-coin-line" title="Fee">
          <Icon name="coin" size={16} /> {brief.fee} fee
        </span>
        <span className="ww-coin-line" title="Budget for wood and extras">
          <Icon name="bag" size={16} /> {brief.budget} budget
        </span>
        <span className="ww-coin-line" title="Due day">
          <Icon name="calendar" size={16} /> Day {brief.deadlineDay}
        </span>
        <span className="ww-coin-line" title="Lowest quality">
          <Icon name="star" size={16} /> {brief.minQuality}+
        </span>
      </div>
      <div className="ww-brief-facts__row">
        {brief.products.map((id) => (
          <TagPill key={id} tone="gold">
            {productById(id).name}
          </TagPill>
        ))}
        {brief.requiredTags.map((tag) => (
          <TagPill key={tag} tone={hotTags.includes(tag) ? "hot" : "plain"}>
            {tag}
          </TagPill>
        ))}
        {brief.requiredExtras.map((need) => (
          <TagPill key={need.extra} tone="sage">
            {need.count} × {extraById(need.extra).name}
          </TagPill>
        ))}
        {brief.avoidWoods.map((id) => (
          <TagPill key={id} tone="danger">
            No {woodById(id).name}
          </TagPill>
        ))}
      </div>
      <div className="ww-brief-facts__row">
        {brief.favouredColours.map((id) => (
          <span key={id} className="ww-brief-facts__swatch" title={`Loves ${shadeById(id).name}`}>
            <span style={{ background: shadeById(id).hex }} /> {shadeById(id).name}
          </span>
        ))}
        {brief.avoidColours.map((id) => (
          <span
            key={id}
            className="ww-brief-facts__swatch ww-brief-facts__swatch--avoid"
            title={`No ${shadeById(id).name}`}
          >
            <span style={{ background: shadeById(id).hex }} /> No {shadeById(id).name}
          </span>
        ))}
      </div>
    </div>
  );
}
