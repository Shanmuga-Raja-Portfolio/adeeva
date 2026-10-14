import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { clientById } from "../../../core";
import { BriefFacts } from "../hub/BriefFacts";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";

export function BriefStage(props: StageProps) {
  const { state, run } = props;
  const brief = run.brief;
  const client = brief === null ? undefined : clientById(brief.clientId);
  return (
    <div className="jb-brief-stage">
      {brief !== null && client !== undefined ? (
        <article className="jb-brief-card jb-measure">
          <div className="jb-brief-card__who">
            <Avatar
              look={client.look}
              mood="delighted"
              size={120}
              title={client.name}
              frameColour="#fbe9c8"
            />
            <div>
              <span className="ad-eyebrow">{client.relation}</span>
              <h2>{brief.occasion}</h2>
              <p className="jb-brief-card__quote">“{client.lines.request}”</p>
              {client.avoidNote.length > 0 ? <p className="jb-muted">{client.avoidNote}</p> : null}
            </div>
          </div>
          <BriefFacts brief={brief} hotTags={state.trends.current} />
          <p className="jb-hint">The order tag stays on the right while you make the piece.</p>
        </article>
      ) : null}
      <StageFooter {...props} ready="Let's design something lovely." />
    </div>
  );
}
