import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { SegmentedControl } from "../../../../../ui/kit/SegmentedControl";
import { SAFETY_LINE } from "../../../content/hints";
import { WALL_IDS, type WallId } from "../../../content/roomTemplate";
import { edgeTolerance, isWallDone, paintById, runEdgePaths } from "../../../core";
import { RoomCutaway } from "../../art/RoomCutaway";
import { roomHex } from "../../art/roomHex";
import { BARE, roomLook } from "../../art/roomLook";
import { useAssist } from "../../useAssist";
import { EdgeStrip } from "./EdgeStrip";
import { RollWall } from "./RollWall";
import { StageFooter } from "./StageFooter";
import { assistHint } from "./stageNames";
import type { StageProps } from "./stageProps";
import "./paint.css";

const WALL_NAMES: Readonly<Record<WallId, string>> = { back: "Back wall", side: "Side wall" };

export function PaintStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const [wall, setWall] = useState<WallId>("back");
  const [assistOn] = useAssist("paint");
  const wallPaint = run.plan.wallPaint === null ? "#ffffff" : roomHex(paintById(run.plan.wallPaint).colour);
  const feature =
    run.plan.featurePaint === null ? wallPaint : roomHex(paintById(run.plan.featurePaint).colour);
  const colour = wall === "back" ? feature : wallPaint;
  const lower = run.plan.lowerPaint === null ? null : roomHex(paintById(run.plan.lowerPaint).colour);
  const tolerance = edgeTolerance(state);
  const paths = runEdgePaths(run).filter((path) => path.wall === wall);
  const look = roomLook(run, BARE);
  const preview = {
    ...look,
    backWall: isWallDone(run, "back") ? feature : null,
    sideWall: isWallDone(run, "side") ? wallPaint : null,
    backLower: isWallDone(run, "back") ? lower : null,
  };
  return (
    <div className="is-paint">
      <div className="is-paint__top">
        <RoomCutaway look={preview} title="The room so far" className="is-paint__preview" />
        <div className="is-paint__intro">
          <SegmentedControl
            label="Wall to paint"
            value={wall}
            onChange={setWall}
            options={WALL_IDS.map((id) => ({
              value: id,
              label: `${WALL_NAMES[id]}${isWallDone(run, id) ? " ✓" : ""}`,
            }))}
          />
          <p className="is-safety">
            <Icon name="shield" size={14} /> {SAFETY_LINE}
          </p>
          {assistOn ? (
            <Button
              variant="secondary"
              icon="sparkle"
              onClick={() => dispatch({ type: "assistPaint", wall })}
              disabled={isWallDone(run, wall)}
              data-testid="assist-paint"
            >
              Brush and roll it for me
            </Button>
          ) : (
            <p className="is-hint">{assistHint("Steady brush", state)}</p>
          )}
        </div>
      </div>
      <section className="is-paint__edges" aria-label="Edging" key={`edges-${wall}`}>
        <h3 className="is-paint__step">
          <span className="is-paint__num">1</span> Edging
        </h3>
        <div className="is-paint__strips">
          {paths.map((path) => (
            <EdgeStrip
              key={path.id}
              path={path}
              done={Object.hasOwn(run.edges, path.id)}
              colour={colour}
              tolerance={tolerance}
              onFinish={(samples) => dispatch({ type: "edgePath", pathId: path.id, samples })}
            />
          ))}
        </div>
      </section>
      <section className="is-paint__rolling" aria-label="Rolling">
        <h3 className="is-paint__step">
          <span className="is-paint__num">2</span> Dip and roll
        </h3>
        <RollWall
          key={wall}
          state={state}
          run={run}
          wall={wall}
          colour={colour}
          lowerColour={wall === "back" ? lower : null}
          dispatch={dispatch}
        />
      </section>
      <StageFooter {...props} ready="Both walls look wonderful!" />
    </div>
  );
}
