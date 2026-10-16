import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { HOME_HINTS } from "../../../content/hints";
import { BUILDER_LOOK } from "../../../content/larkspurStoryBeat";
import { clientById } from "../../../core";
import { StoryCard } from "../larkspur/StoryCard";
import { homeRoomContext } from "./homeRoomContext";
import { RoomCutaway } from "../../art/RoomCutaway";
import { BARE, roomLook } from "../../art/roomLook";
import { BriefFacts } from "../hub/BriefFacts";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";

export function BriefStage(props: StageProps) {
  const { state, run } = props;
  const client = clientById(run.brief.clientId);
  const home = homeRoomContext(state, run);
  return (
    <div className="is-brief-stage">
      <article className="is-brief-card is-tape-card">
        {home !== null ? (
          <div className="is-brief-card__who is-brief-card__who--home">
            <Avatar
              look={BUILDER_LOOK}
              mood="delighted"
              size={120}
              title="Ms. Achebe"
              frameColour="#fcefc2"
            />
            <div>
              <span className="ad-eyebrow">
                {home.plot.name} · room {run.purpose.kind === "home-room" ? run.purpose.roomIndex + 1 : 1} of{" "}
                {home.project.rooms.length}
              </span>
              <h2>The {home.purpose.name}</h2>
              <p className="is-brief-card__quote">“{home.purpose.blurb}”</p>
              <p className="is-muted">
                Ms. Achebe: Use the home palette, and {HOME_HINTS.throughDoor.toLowerCase()}
              </p>
            </div>
            <StoryCard story={home.story} compact />
          </div>
        ) : client !== undefined ? (
          <div className="is-brief-card__who">
            <Avatar
              look={client.look}
              mood="delighted"
              size={120}
              title={client.name}
              frameColour="#fcefc2"
            />
            <div>
              <span className="ad-eyebrow">{client.relation}</span>
              <h2>{client.name}</h2>
              <p className="is-brief-card__quote">“{client.lines.request}”</p>
              <p className="is-muted">{client.avoidNote}</p>
            </div>
          </div>
        ) : null}
        <div className="is-brief-card__room">
          <RoomCutaway
            look={roomLook(run, BARE)}
            title="The empty room, waiting for you"
            className="is-brief-card__cutaway"
          />
          <BriefFacts brief={run.brief} hotTags={state.trends.current} />
        </div>
        <p className="is-hint">The brief stays on the right while you make the room.</p>
      </article>
      <StageFooter {...props} ready="Let's plan something lovely." />
    </div>
  );
}
