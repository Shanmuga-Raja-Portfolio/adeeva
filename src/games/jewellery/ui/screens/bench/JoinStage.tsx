import { useRef, useState } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Icon } from "../../../../../ui/kit/IconSet";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { SAFETY_LINE } from "../../../content/hints";
import { SegmentedControl } from "../../../../../ui/kit/SegmentedControl";
import {
  isJoinDone,
  joinAccuracy,
  joinZone,
  metalById,
  runJoints,
  twinOffered,
  twinZones,
} from "../../../core";
import { CelebrationBurst } from "../../art/CelebrationBurst";
import { metalLook } from "../../art/metalLook";
import { useAssist } from "../../useAssist";
import { useFocusCarry } from "../../useFocusCarry";
import { LampBench } from "./LampBench";
import { StageFooter } from "./StageFooter";
import { TwinLampBench } from "./TwinLampBench";
import { assistHint } from "./stageNames";
import type { StageProps } from "./stageProps";
import "./join.css";

export function JoinStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const { reducedMotion } = useSettings();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [assist, setAssist] = useAssist("join");
  const [restarts, setRestarts] = useState(0);
  const joints = runJoints(run);
  const firstOpen = joints.find((joint) => !isJoinDone(run.joins[joint.id], joint.ticks))?.id ?? null;
  const [picked, setPicked] = useState<string | null>(null);
  const [mode, setMode] = useState<"twin" | "single">("twin");
  const [first, second] = joints;
  const canTwin =
    twinOffered(state, run) &&
    Object.keys(run.joins).length === 0 &&
    first !== undefined &&
    second !== undefined;
  const twinRecorded = Object.values(run.joins).some((record) => record.twin);
  const activeId =
    picked !== null && !isJoinDone(run.joins[picked], joints.find((joint) => joint.id === picked)?.ticks ?? 0)
      ? picked
      : firstOpen;
  const active = joints.find((joint) => joint.id === activeId);
  const metalId = run.design.metalId;
  const done = joints.filter((joint) => isJoinDone(run.joins[joint.id], joint.ticks)).length;
  useFocusCarry(
    stageRef,
    `${active?.id ?? "none"}-${restarts}`,
    '[data-testid="warm-button"], [data-testid="advance-stage"]:not(:disabled)',
  );
  return (
    <div className="jb-join" ref={stageRef}>
      <div className="jb-work">
        <aside className="jb-work__list jb-measure">
          <header>
            <strong>Seams to join</strong>
            <span className="jb-muted">
              {" "}
              {done}/{joints.length} joined
            </span>
          </header>
          <ul>
            {joints.map((joint) => {
              const record = run.joins[joint.id];
              const finished = isJoinDone(record, joint.ticks);
              return (
                <li key={joint.id}>
                  <button
                    type="button"
                    className="jb-work__item"
                    disabled={finished}
                    aria-pressed={joint.id === activeId}
                    onClick={() => setPicked(joint.id)}
                  >
                    <span>{joint.name}</span>
                    <span className="jb-work__state">
                      {finished && record !== undefined ? (
                        <>
                          <Icon name="check" size={14} /> {Math.round(joinAccuracy(record) * 100)}%
                        </>
                      ) : (
                        "To join"
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {canTwin ? (
            <SegmentedControl
              label="How to join the pair"
              value={mode}
              onChange={setMode}
              options={[
                { value: "twin", label: "Join both" },
                { value: "single", label: "One at a time" },
              ]}
            />
          ) : null}
          <ToggleSwitch
            label="Steady lamp"
            description="The lamp holds the glow in the gold zone."
            checked={assist}
            onChange={setAssist}
          />
          <p className="jb-hint">{assistHint("the steady lamp")}</p>
          <p className="jb-safety">
            <Icon name="shield" size={14} /> {SAFETY_LINE}
          </p>
        </aside>
        <div className="jb-work__stage">
          <CelebrationBurst key={done} active={done > 0} />
          {canTwin && mode === "twin" && metalId !== null && first !== undefined && second !== undefined ? (
            <TwinLampBench
              joints={[first, second]}
              zones={twinZones(state)}
              warmRate={metalById(metalId).warmRate}
              assisted={assist}
              metal={metalLook(metalId, "high-shine")}
              reducedMotion={reducedMotion}
              onRecord={(ticks, seams, assisted) =>
                dispatch({ type: "recordTwinJoin", ticks, seams, assisted })
              }
            />
          ) : active !== undefined && metalId !== null ? (
            <LampBench
              key={`${active.id}-${restarts}`}
              joint={active}
              stored={run.joins[active.id]}
              zone={joinZone(state)}
              warmRate={metalById(metalId).warmRate}
              assisted={assist}
              metal={metalLook(metalId, "high-shine")}
              reducedMotion={reducedMotion}
              onRecord={(record) => dispatch({ type: "recordJoin", jointId: active.id, ...record })}
              onRestart={() => {
                if (dispatch({ type: "restartJoin", jointId: active.id })) setRestarts((count) => count + 1);
              }}
            />
          ) : (
            <div className="jb-work__done">
              <Icon name="sparkle" size={32} />
              <p>Every seam is joined. Smooth as silk!</p>
              {twinRecorded ? (
                <p className="jb-twin-note" data-testid="twin-note">
                  {run.twinGlow
                    ? "Two seams, one glow: an hour saved!"
                    : "Both seams joined at once. No twin glow this time, and that's just fine."}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
      <StageFooter {...props} ready="All joined. Lovely work!" />
    </div>
  );
}
