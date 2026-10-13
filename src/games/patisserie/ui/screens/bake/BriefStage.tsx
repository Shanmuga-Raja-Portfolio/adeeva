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
    <div className="pa-brief-stage">
      {brief !== null && client !== undefined ? (
        <article className="pa-brief-card pa-doily">
          <div className="pa-brief-card__who">
            <Avatar
              look={client.look}
              mood="delighted"
              size={120}
              title={client.name}
              frameColour="#fde6cf"
            />
            <div>
              <span className="ad-eyebrow">{client.relation}</span>
              <h2>{brief.occasion}</h2>
              <p className="pa-brief-card__quote">“{client.lines.request}”</p>
            </div>
          </div>
          <BriefFacts brief={brief} hotTags={state.trends.current} />
          <p className="pa-hint">
            Flavour wishes are just what they like best. The checklist on the right stays with you as you
            bake.
          </p>
        </article>
      ) : null}
      <StageFooter {...props} ready="Let's design something lovely." />
    </div>
  );
}
