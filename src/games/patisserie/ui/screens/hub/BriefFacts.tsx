import { colourById } from "../../../../../engine/palette";
import { Icon } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { mixById, productById, toppingById, type Brief } from "../../../core";

export interface BriefFactsProps {
  readonly brief: Brief;
  readonly hotTags: readonly string[];
}

export function BriefFacts({ brief, hotTags }: BriefFactsProps) {
  return (
    <div className="pa-brief-facts">
      <div className="pa-brief-facts__row">
        <span className="pa-coin-line" title="Fee">
          <Icon name="coin" size={16} /> {brief.fee} fee
        </span>
        <span className="pa-coin-line" title="Ingredient budget">
          <Icon name="bag" size={16} /> {brief.budget} budget
        </span>
        <span className="pa-coin-line" title="Due day">
          <Icon name="calendar" size={16} /> Day {brief.deadlineDay}
        </span>
        <span className="pa-coin-line" title="Lowest quality">
          <Icon name="star" size={16} /> {brief.minQuality}+
        </span>
      </div>
      <div className="pa-brief-facts__row">
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
        {brief.requiredMixes.map((id) => (
          <TagPill key={id} tone="sage">
            {mixById(id).name}
          </TagPill>
        ))}
        {brief.avoidMixes.map((id) => (
          <TagPill key={id} tone="danger">
            Not {mixById(id).name}
          </TagPill>
        ))}
      </div>
      <div className="pa-brief-facts__row">
        {brief.favouredColours.map((id) => (
          <span key={id} className="pa-brief-facts__swatch" title={`Loves ${colourById(id).name}`}>
            <span style={{ background: colourById(id).hex }} /> {colourById(id).name}
          </span>
        ))}
        {brief.avoidColours.map((id) => (
          <span
            key={id}
            className="pa-brief-facts__swatch pa-brief-facts__swatch--avoid"
            title={`No ${colourById(id).name}`}
          >
            <span style={{ background: colourById(id).hex }} /> No {colourById(id).name}
          </span>
        ))}
        {brief.requiredToppings.map((requirement) => (
          <TagPill key={requirement.topping}>
            {requirement.count} × {toppingById(requirement.topping).name}
          </TagPill>
        ))}
      </div>
    </div>
  );
}
