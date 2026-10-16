import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Icon } from "../../../../../ui/kit/IconSet";
import { HATTIE_LOOK } from "../../../content/panelMember";
import { clientById, runPieces, setTemplateById } from "../../../core";
import { setLooks } from "../../art/pieceLook";
import { SetPreview } from "../../art/SetPreview";
import { BriefFacts } from "../hub/BriefFacts";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";

export function BriefStage(props: StageProps) {
  const { state, run } = props;
  const brief = run.brief;
  const client = clientById(brief.clientId);
  const purpose = run.purpose;
  if (purpose.kind === "set") {
    const template = setTemplateById(purpose.templateId);
    return (
      <div className="ww-brief-stage">
        <article className="ww-brief-card ww-note">
          <span className="ww-pin" aria-hidden="true" />
          <div className="ww-brief-card__who">
            <Avatar
              look={HATTIE_LOOK}
              mood="delighted"
              size={120}
              title="Hattie Rowe"
              frameColour="#f3dcc0"
            />
            <div>
              <span className="ad-eyebrow">A matched set for the showroom floor</span>
              <h2>{template.name}</h2>
              <p className="ww-brief-card__quote">“{brief.occasion}. One wood, one finish, one style.”</p>
              <p className="ww-hint">
                <Icon name="star" size={16} />{" "}
                {runPieces(run)
                  .map((piece) => piece.name)
                  .join(" · ")}
              </p>
            </div>
          </div>
          <SetPreview
            looks={setLooks(run)}
            title={`Sketch of the ${template.name}`}
            className="ww-brief-card__set"
          />
          <p className="ww-hint">
            <Icon name="check" size={16} /> Hattie's checklist stays pinned on the right while you build. It's
            guidance, not a test.
          </p>
        </article>
        <StageFooter {...props} ready="Let's design a matched set." />
      </div>
    );
  }
  return (
    <div className="ww-brief-stage">
      {client !== undefined ? (
        <article className="ww-brief-card ww-note">
          <span className="ww-pin" aria-hidden="true" />
          <div className="ww-brief-card__who">
            <Avatar
              look={client.look}
              mood="delighted"
              size={120}
              title={client.name}
              frameColour="#dfe7ee"
            />
            <div>
              <span className="ad-eyebrow">{client.relation}</span>
              <h2>{brief.occasion}</h2>
              <p className="ww-brief-card__quote">“{client.lines.request}”</p>
              {client.payer !== null ? (
                <p className="ww-hint">
                  <Icon name="heart" size={16} /> {client.payer} pays and picks it up.
                </p>
              ) : null}
            </div>
          </div>
          <BriefFacts brief={brief} hotTags={state.trends.current} />
          <p className="ww-hint">
            <Icon name="check" size={16} /> The note stays pinned on the right while you build.
          </p>
        </article>
      ) : null}
      <StageFooter {...props} ready="Let's design something lovely." />
    </div>
  );
}
