import { materialById, trimById } from "../../../core";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { TrimBadge } from "../../art/TrimArt";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { briefOwner } from "./briefOwner";
import { ColourDot } from "./ColourDot";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import "./brief.css";

function daysLabel(days: number): string {
  if (days < 0) return `${-days} ${days === -1 ? "day" : "days"} late`;
  if (days === 0) return "due today";
  return `in ${days} ${days === 1 ? "day" : "days"}`;
}

export function BriefStage(props: StageProps) {
  const { state, run } = props;
  const { brief } = run;
  const { client, theme } = briefOwner(brief);
  const daysLeft = brief.deadlineDay - state.calendar.day;
  return (
    <div className="ad-brief-stage">
      <Card className="ad-brief-card" tone="rose">
        <div className="ad-brief-card__who">
          {client !== undefined ? (
            <Avatar look={client.look} mood="happy" size={132} title={`${client.name} portrait`} />
          ) : (
            <span className="ad-brief-card__theme-mark" aria-hidden="true">
              <Icon name="sparkle" size={56} />
            </span>
          )}
          <div>
            <span className="ad-eyebrow">{client?.relation ?? theme?.venue ?? "Collection look"}</span>
            <h2 className="ad-brief-card__name">{client?.name ?? theme?.name ?? "Your label"}</h2>
            <p className="ad-brief-card__occasion">{brief.occasion}</p>
          </div>
        </div>
        <blockquote className="ad-brief-card__quote">
          {client?.lines.request ?? theme?.pitch ?? "Make something the whole room remembers."}
        </blockquote>
      </Card>

      <div className="ad-brief-facts">
        <div className="ad-brief-fact">
          <Icon name="coin" size={22} />
          <span className="ad-brief-fact__label">Budget</span>
          <strong>{brief.budget} coins</strong>
          <small>for fabric used and trims placed</small>
        </div>
        <div className="ad-brief-fact">
          <Icon name="heart" size={22} />
          <span className="ad-brief-fact__label">Fee</span>
          <strong>{brief.fee > 0 ? `${brief.fee} coins` : "Show glory"}</strong>
          <small>{brief.fee > 0 ? "more for a higher score" : "scored on the runway"}</small>
        </div>
        <div className="ad-brief-fact">
          <Icon name="calendar" size={22} />
          <span className="ad-brief-fact__label">Deadline</span>
          <strong>Day {brief.deadlineDay}</strong>
          <small>{daysLabel(daysLeft)}</small>
        </div>
        <div className="ad-brief-fact">
          <Icon name="star" size={22} />
          <span className="ad-brief-fact__label">Quality</span>
          <strong>At least {brief.minQuality}</strong>
          <small>from cutting, sewing, grain and fabric fit</small>
        </div>
      </div>

      <Card className="ad-brief-wishes" title="What they are hoping for">
        <ul className="ad-brief-chips">
          {brief.requiredTags.map((tag) => (
            <li key={tag} className="ad-brief-chip ad-brief-chip--must">
              <Icon name="sparkle" size={16} /> Feels {tag}
            </li>
          ))}
          {brief.requiredTrims.map((requirement) => (
            <li key={requirement.trim} className="ad-brief-chip ad-brief-chip--must">
              <TrimBadge trimId={requirement.trim} size={28} />
              {requirement.count} × {trimById(requirement.trim).name}
            </li>
          ))}
          {brief.favouredColours.map((colour) => (
            <li key={`love-${colour}`} className="ad-brief-chip ad-brief-chip--love">
              <span className="ad-brief-chip__lead">Loves</span>
              <ColourDot colourId={colour} />
            </li>
          ))}
          {brief.avoidColours.map((colour) => (
            <li key={`avoid-${colour}`} className="ad-brief-chip ad-brief-chip--avoid">
              <span className="ad-brief-chip__lead">No</span>
              <ColourDot colourId={colour} crossed />
            </li>
          ))}
          {brief.avoidMaterials.map((material) => (
            <li key={`material-${material}`} className="ad-brief-chip ad-brief-chip--avoid">
              <span className="ad-brief-chip__lead">No</span>
              {materialById(material).name}
            </li>
          ))}
        </ul>
      </Card>

      <StageFooter {...props} hint="Read it through, then start sketching." />
    </div>
  );
}
