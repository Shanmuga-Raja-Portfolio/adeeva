import { useState } from "react";
import type { Point } from "../../../../../../engine/geometry/point";
import { Button } from "../../../../../../ui/kit/Button";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { Meter } from "../../../../../../ui/kit/Meter";
import { ToggleSwitch } from "../../../../../../ui/kit/ToggleSwitch";
import { HINTS } from "../../../../content/hint";
import {
  ACROSS_WARNING_SHARE,
  crossShare,
  designSurfaces,
  isSurfaceDone,
  isSurfaceWornOut,
  runPieces,
  sandAngleLimit,
  sandRecordOf,
  surfaceSmooth,
} from "../../../../core";
import { useAssist } from "../../../useAssist";
import { RenHandOff } from "../set/RenHandOff";
import { ShineBar } from "../set/ShineBar";
import { StageFooter } from "../StageFooter";
import type { StageProps } from "../stageProps";
import { SandBench } from "./SandBench";
import "./sand.css";

const REN_LOVELY_PERCENT = 85;

export function SandStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const [assisted, setAssisted] = useAssist("sand");
  const [chosen, setChosen] = useState<string | null>(null);
  const [rubbingOn, setRubbingOn] = useState<string | null>(null);
  const surfaces = designSurfaces(run);
  const woodId = run.design.woodId;
  const open = surfaces.filter((part) => !isSurfaceDone(sandRecordOf(run, part.id)));
  const surface =
    surfaces.find((part) => part.id === chosen) ??
    surfaces.find((part) => part.id === rubbingOn) ??
    open[0] ??
    surfaces[0];
  const record = surface === undefined ? null : sandRecordOf(run, surface.id);
  const renShine = record === null ? null : record.renAccuracy;
  const byRen = renShine !== null;
  const smoothPercent = record === null ? 0 : Math.round((renShine ?? surfaceSmooth(record)) * 100);
  const scratchy =
    record !== null && !byRen && record.strokes >= 3 && crossShare(record) > ACROSS_WARNING_SHARE;

  const rub = (points: readonly Point[], stillRubbing: boolean) => {
    if (surface === undefined) return;
    setRubbingOn(stillRubbing ? surface.id : null);
    dispatch({ type: "sandDrag", surfaceId: surface.id, points, assisted });
  };

  return (
    <div className="ww-sand">
      <ul className="ww-sand__list" aria-label="Surfaces to sand">
        {surfaces.map((part) => {
          const done = isSurfaceDone(sandRecordOf(run, part.id));
          return (
            <li key={part.id}>
              <button
                type="button"
                className={[
                  "ww-sand__chip",
                  part.id === surface?.id ? "ww-sand__chip--current" : "",
                  done ? "ww-sand__chip--done" : "",
                ].join(" ")}
                onClick={() => setChosen(part.id)}
                aria-pressed={part.id === surface?.id}
              >
                {done ? <Icon name="check" size={14} /> : null} {part.name}
              </button>
            </li>
          );
        })}
      </ul>
      {surface !== undefined && record !== null && woodId !== null ? (
        <div className="ww-sand__table ww-paper">
          <div className="ww-sand__head">
            <div>
              <span className="ad-eyebrow">Rub back and forth along the arrow</span>
              <h2 className="ww-sand__title">{surface.name}</h2>
            </div>
            <div className="ww-assist">
              <ToggleSwitch
                label="Wood-line guide"
                description="Strokes snap along the lines. Scores up to 70%."
                checked={assisted}
                onChange={setAssisted}
              />
            </div>
          </div>
          <SandBench
            key={surface.id}
            woodId={woodId}
            record={record}
            angleLimit={sandAngleLimit(state)}
            assisted={assisted}
            seed={surface.id.length * 131 + 7}
            onRub={rub}
          />
          <div className="ww-sand__status">
            <Meter
              label="Smoothness"
              tone="sage"
              value={smoothPercent}
              max={100}
              valueText={`${smoothPercent}%`}
            />
            <p
              className={scratchy ? "ww-sand__message ww-sand__message--warn" : "ww-sand__message"}
              role="status"
              aria-live="polite"
            >
              {byRen
                ? `Ren sanded ${surface.name} to ${smoothPercent}%. ${smoothPercent >= REN_LOVELY_PERCENT ? "Lovely and even!" : "Steady work, and Ren is still learning."}`
                : isSurfaceDone(record)
                  ? `${surface.name} is smooth! Keep rubbing for silky.`
                  : isSurfaceWornOut(record)
                    ? "That's lots of rubbing! Tap Start this surface again."
                    : scratchy
                      ? HINTS.sandAlong
                      : "Rub until the dust is gone."}
            </p>
            <Button
              variant="ghost"
              className="ww-big-button"
              onClick={() => dispatch({ type: "resetSurface", surfaceId: surface.id })}
              disabled={record.strokes === 0}
            >
              Start this surface again
            </Button>
          </div>
        </div>
      ) : null}
      {runPieces(run).length > 1 ? <ShineBar run={run} /> : null}
      <RenHandOff {...props} job="sand" />
      <StageFooter {...props} ready="Smooth as a pebble. Time for a finish!" />
    </div>
  );
}
