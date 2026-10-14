import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { clientById } from "../../../core";
import { PriceTag } from "../../art/PriceTag";
import { BriefFacts, finishList, recipeList } from "../hub/briefFacts";
import { ColourChip } from "./ColourChip";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";

export function BriefStage(props: StageProps) {
  const { brief } = props.run;
  if (brief === null) return null;
  const client = clientById(brief.clientId);
  return (
    <div className="tf-brief">
      <div className="tf-brief__card">
        {client !== undefined ? (
          <figure className="tf-brief__client">
            <Avatar look={client.look} mood="happy" size={150} frameColour="#e2f4ea" title={client.name} />
            <figcaption>
              <strong className="tf-brief__name">{client.name}</strong>
              <span>{client.relation}</span>
            </figcaption>
          </figure>
        ) : null}
        <div className="tf-brief__speech">
          <p className="tf-brief__quote">“{client?.lines.request ?? brief.occasion}”</p>
        </div>
      </div>
      <PriceTag tilt={-1}>
        <div className="tf-brief__order">
          <h2>{recipeList(brief)}</h2>
          <BriefFacts brief={brief} />
          <div className="tf-brief__row">
            <span className="ad-eyebrow">Should feel</span>
            {brief.requiredTags.map((tag) => (
              <TagPill key={tag} tone="hot">
                {tag}
              </TagPill>
            ))}
          </div>
          <div className="tf-brief__row">
            <span className="ad-eyebrow">Favourite colours</span>
            {brief.favouredColours.map((colour) => (
              <ColourChip key={colour} colourId={colour} />
            ))}
            {brief.avoidColours.map((colour) => (
              <ColourChip key={colour} colourId={colour} crossed />
            ))}
            {brief.avoidMaterials.map((material) => (
              <TagPill key={material} tone="danger">
                No {material}
              </TagPill>
            ))}
          </div>
          <div className="tf-brief__row">
            <span className="ad-eyebrow">Finishing touches</span>
            <span>{finishList(brief)}</span>
          </div>
          {brief.minLeaves > 0 ? (
            <div className="tf-brief__row">
              <span className="ad-eyebrow">Leaves</span>
              <span>At least {brief.minLeaves}</span>
            </div>
          ) : null}
        </div>
      </PriceTag>
      <StageFooter {...props} hint="Got it! Time to plan the flip." />
    </div>
  );
}
