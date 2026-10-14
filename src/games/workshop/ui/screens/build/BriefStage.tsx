import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Icon } from "../../../../../ui/kit/IconSet";
import { clientById } from "../../../core";
import { BriefFacts } from "../hub/BriefFacts";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";

export function BriefStage(props: StageProps) {
  const { state, run } = props;
  const brief = run.brief;
  const client = clientById(brief.clientId);
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
