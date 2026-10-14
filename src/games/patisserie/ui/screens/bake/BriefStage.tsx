import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { MARIGOLD } from "../../../content/panelMember";
import { clientById, fairThemeById } from "../../../core";
import { ThemeCard } from "../season/ThemeCard";
import { BriefFacts } from "../hub/BriefFacts";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";

export function BriefStage(props: StageProps) {
  const { state, run } = props;
  const brief = run.brief;
  const client = brief === null ? undefined : clientById(brief.clientId);
  return (
    <div className="pa-brief-stage">
      {brief !== null && run.purpose.kind === "showpiece" && state.fair?.themeId != null ? (
        <article className="pa-brief-card pa-doily" data-testid="fair-brief">
          <div className="pa-brief-card__who">
            <Avatar
              look={MARIGOLD.look}
              mood="delighted"
              size={120}
              title={MARIGOLD.name}
              frameColour="#fdf0d6"
            />
            <div>
              <span className="ad-eyebrow">
                {MARIGOLD.name} · {MARIGOLD.role}
              </span>
              <h2>{brief.occasion}</h2>
              <p className="pa-brief-card__quote">
                “Bring one showpiece that feels {brief.requiredTags.join(" and ")}. Every baker goes home with
                a ribbon!”
              </p>
            </div>
          </div>
          <ThemeCard theme={fairThemeById(state.fair.themeId)} />
          <BriefFacts brief={brief} hotTags={state.trends.current} fair />
          <p className="pa-hint">
            The checklist shows what makes it Ready for the Fair. It is only a guide: the Fair is glad to see
            you either way.
          </p>
        </article>
      ) : null}
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
