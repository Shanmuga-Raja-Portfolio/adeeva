import { colourById, trimById, type Brief } from "../../../core";
import { Icon } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";

export interface BriefSummaryProps {
  brief: Brief;
  hotTags: readonly string[];
}

export function BriefSummary({ brief, hotTags }: BriefSummaryProps) {
  const trims = brief.requiredTrims
    .map((requirement) => `${requirement.count} × ${trimById(requirement.trim).name}`)
    .join(", ");
  return (
    <div className="ad-brief">
      <div className="ad-brief__tags">
        {brief.requiredTags.map((tag) => (
          <TagPill key={tag} tone={hotTags.includes(tag) ? "hot" : "plain"}>
            {hotTags.includes(tag) ? <Icon name="sparkle" size={12} /> : null}
            {tag}
          </TagPill>
        ))}
        {brief.favouredColours.length > 0 ? (
          <span className="ad-brief__colours" aria-label="Favourite colours">
            {brief.favouredColours.map((id) => {
              const colour = colourById(id);
              return (
                <span
                  key={id}
                  className="ad-brief__dot"
                  style={{ background: colour.hex }}
                  title={`Loves ${colour.name}`}
                />
              );
            })}
          </span>
        ) : null}
      </div>
      <dl className="ad-brief__facts">
        <div>
          <dt>Fee</dt>
          <dd>
            <Icon name="coin" size={14} /> {brief.fee}
          </dd>
        </div>
        <div>
          <dt>Budget</dt>
          <dd>{brief.budget}</dd>
        </div>
        <div>
          <dt>Quality</dt>
          <dd>{brief.minQuality}+</dd>
        </div>
      </dl>
      {trims.length > 0 ? <p className="ad-brief__note">Needs {trims}</p> : null}
    </div>
  );
}
