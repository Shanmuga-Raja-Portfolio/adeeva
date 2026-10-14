import { Icon } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { roomColourById, type RoomColour } from "../../../content/roomColour";
import type { RoomTag } from "../../../content/roomTag";
import { itemName, roomById, type Brief } from "../../../core";

export interface BriefFactsProps {
  readonly brief: Brief;
  readonly hotTags: readonly RoomTag[];
}

function Swatches({ colours }: { readonly colours: readonly RoomColour[] }) {
  return (
    <span className="is-facts__swatches">
      {colours.map((colour) => {
        const def = roomColourById(colour);
        return (
          <span key={colour} className="is-facts__swatch">
            <span className="is-facts__dot" style={{ background: def.hex }} />
            {def.name}
          </span>
        );
      })}
    </span>
  );
}

const MOOD_LABELS = { warm: "Warm light", cool: "Cool light", any: "Any light" } as const;

export function BriefFacts({ brief, hotTags }: BriefFactsProps) {
  const room = roomById(brief.roomId);
  return (
    <dl className="is-facts">
      <div>
        <dt>Room</dt>
        <dd>
          <Icon name="home" size={15} /> {room.name} · {room.cols} × {room.rows} squares
        </dd>
      </div>
      <div>
        <dt>Feels</dt>
        <dd className="is-facts__tags">
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
      {brief.avoidColours.length > 0 ? (
        <div>
          <dt>Please avoid</dt>
          <dd>
            <Swatches colours={brief.avoidColours} />
          </dd>
        </div>
      ) : null}
      <div>
        <dt>Must-haves</dt>
        <dd>{brief.mustHaves.map((need) => `${need.count} × ${itemName(need.itemId)}`).join(", ")}</dd>
      </div>
      <div>
        <dt>Light</dt>
        <dd>
          <Icon name="sparkle" size={15} /> {MOOD_LABELS[brief.mood]}
        </dd>
      </div>
      <div className="is-facts__numbers">
        <span>
          <Icon name="coin" size={15} /> Budget {brief.budget}
        </span>
        <span>
          <Icon name="coin" size={15} /> Pays up to {brief.fee}
        </span>
        <span>
          <Icon name="calendar" size={15} /> Reveal by day {brief.deadlineDay}
        </span>
        <span>
          <Icon name="star" size={15} /> Quality {brief.minQuality}+
        </span>
      </div>
    </dl>
  );
}
