import type { AvatarLook } from "../../../../../engine/avatar";
import type { RunwayLightId } from "../../../content/runwayLight";
import { RunwayStage } from "../../art/RunwayStage";
import type { ShowWalker } from "./showCast";
import { ShowCaption } from "./ShowCaption";
import { ShowTitleCard } from "./ShowTitleCard";
import type { ShowMoment } from "./showTimeline";
import { StageFigures } from "./StageFigures";
import { stageShot } from "./stageShot";

export interface ShowFrameProps {
  moment: ShowMoment;
  cast: readonly ShowWalker[];
  light: RunwayLightId;
  venue: string;
  seasonNumber: number;
  themeName: string;
  designerName: string;
  designerLook: AvatarLook;
  audience: number;
  hearts: string;
  petalColours: readonly string[];
  still: boolean;
  opacity: number;
}

export function ShowFrame({
  moment,
  cast,
  light,
  venue,
  seasonNumber,
  themeName,
  designerName,
  designerLook,
  audience,
  hearts,
  petalColours,
  still,
  opacity,
}: ShowFrameProps) {
  const kind = moment.segment.kind;
  const shot = stageShot(moment, cast, audience, still);
  const walker = kind === "walk" ? (cast[moment.segment.walk] ?? null) : null;
  const sceneT = still ? 0.62 : moment.t;
  return (
    <div className="ad-show__frame" style={{ opacity }}>
      {kind === "title" ? null : (
        <div className="ad-show__stage">
          <RunwayStage
            light={light}
            progress={shot.focus}
            flashes={shot.flashes}
            venue={venue}
            className="ad-show__runway"
            title={`${themeName} on the runway at ${venue}`}
          />
          <StageFigures
            shot={shot}
            sceneT={sceneT}
            designer={designerLook}
            hearts={hearts}
            petalColours={petalColours}
          />
          <div className="ad-show__dark" style={{ opacity: shot.darkness }} />
          <div className="ad-show__burst" style={{ opacity: shot.burst }} />
        </div>
      )}
      {kind === "title" ? (
        <ShowTitleCard
          t={moment.t}
          seasonNumber={seasonNumber}
          themeName={themeName}
          venue={venue}
          designer={designerName}
          still={still}
        />
      ) : null}
      <ShowCaption
        kind={kind}
        t={moment.t}
        walker={walker}
        walks={cast.length}
        designer={designerName}
        themeName={themeName}
        still={still}
      />
    </div>
  );
}
