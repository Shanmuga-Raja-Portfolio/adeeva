import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { HINTS } from "../../../content/hint";
import { findById, personById, type Brief, type FlipRun } from "../../../core";
import { FindArt } from "../../art/FindArt";
import { PriceTag } from "../../art/PriceTag";
import { BriefFacts, finishList, recipeList, requestLine, ticketBadge } from "../hub/briefFacts";
import { ColourChip } from "./ColourChip";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";

const TICKET_STEPS: Readonly<Record<"mend" | "alter", readonly string[]>> = {
  mend: ["Snip the split open", "Lift the stain", "Sew it closed", "Add a mend stitch or a patch"],
  alter: ["Snip the old hem", "Lay a hem band on the bottom edge", "Cut it out", "Sew the fresh hem"],
};

function TicketOrder({ brief, run }: { readonly brief: Brief; readonly run: FlipRun }) {
  const lent = run.finds[0];
  const kind = brief.kind === "alter" ? "alter" : "mend";
  return (
    <div className="tf-brief__order tf-brief__order--ticket">
      <span className="tf-ticket-badge">{ticketBadge(brief)}</span>
      <h2>{recipeList(brief)}</h2>
      {lent === undefined ? null : (
        <div className="tf-brief__item">
          <FindArt
            find={findById(lent.findId)}
            grade={lent.grade}
            size={120}
            title={findById(lent.findId).name}
          />
          <span>
            <strong>{findById(lent.findId).name}</strong>
            <span className="ad-muted">Lent by the client. It goes home after.</span>
          </span>
        </div>
      )}
      <BriefFacts brief={brief} />
      <ol className="tf-brief__steps">
        {TICKET_STEPS[kind].map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="tf-brief__row">
        <span className="ad-eyebrow">Favourite colours</span>
        {brief.favouredColours.map((colour) => (
          <ColourChip key={colour} colourId={colour} />
        ))}
      </div>
      <p className="tf-brief__free">
        {kind === "mend" ? HINTS.mend : HINTS.hem} Mend stitches are free here.
      </p>
    </div>
  );
}

function FlipOrder({ brief }: { readonly brief: Brief }) {
  return (
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
  );
}

export function BriefStage(props: StageProps) {
  const { brief } = props.run;
  if (brief === null) return null;
  const client = personById(brief.clientId);
  const ticket = brief.kind !== "flip";
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
          <p className="tf-brief__quote">“{requestLine(brief, client)}”</p>
        </div>
      </div>
      <PriceTag tilt={-1}>
        {ticket ? <TicketOrder brief={brief} run={props.run} /> : <FlipOrder brief={brief} />}
      </PriceTag>
      <StageFooter
        {...props}
        hint={ticket ? "Got it! Off to the workbench." : "Got it! Time to plan the flip."}
      />
    </div>
  );
}
