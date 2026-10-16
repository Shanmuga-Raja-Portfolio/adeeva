import { useState } from "react";
import { Button } from "../../../../../../ui/kit/Button";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { ToggleSwitch } from "../../../../../../ui/kit/ToggleSwitch";
import { useFocusAfterRender } from "../../../../../../ui/kit/useFocusAfterRender";
import {
  ASSIST_JOINT_ACCURACY_CAP,
  designJoints,
  designParts,
  jointKindById,
  jointStartPose,
  jointTargetAngle,
  jointTaps,
  runJointTolerance,
  type JointPose,
} from "../../../../core";
import { PiecePreview } from "../../../art/PiecePreview";
import { pieceLook } from "../../../art/pieceLook";
import { useAssist } from "../../../useAssist";
import { FirstJointCard } from "../set/FirstJointCard";
import { RenHandOff } from "../set/RenHandOff";
import { StageFooter } from "../StageFooter";
import type { StageProps } from "../stageProps";
import { JoinBench } from "./JoinBench";
import "./join.css";

function fitWord(accuracy: number): string {
  if (accuracy >= 0.9) return "Snug as a bug!";
  if (accuracy >= 0.7) return "Nice and firm.";
  return "Holding on.";
}

export function JoinStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const [magnet, setMagnet] = useAssist("join");
  const [chosen, setChosen] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const focusAfter = useFocusAfterRender();
  const joints = designJoints(run);
  const woodId = run.design.woodId;
  const open = joints.filter((joint) => !Object.hasOwn(run.joints, joint.id));
  const joint =
    joints.find((entry) => entry.id === chosen && !Object.hasOwn(run.joints, entry.id)) ?? open[0];
  const index = joint === undefined ? -1 : joints.indexOf(joint);
  const tolerance = joint === undefined ? null : runJointTolerance(state, run, joint);
  const target = joint === undefined ? 0 : jointTargetAngle(run.design, joint);
  const look = joint === undefined ? null : pieceLook(run, joint.piece);
  const highlight =
    joint === undefined
      ? null
      : (designParts(run).find((part) => part.id === joint.movingPart)?.baseId ?? null);
  const purpose = run.purpose;
  const firstShow =
    purpose.kind === "set"
      ? joints.find((entry) => entry.kind === purpose.setJoint && Object.hasOwn(run.joints, entry.id))
      : undefined;
  const firstRecord = firstShow === undefined ? undefined : run.joints[firstShow.id];

  const seat = (pose: JointPose, goodTaps: number) => {
    if (joint === undefined) return;
    if (dispatch({ type: "seatJoint", jointId: joint.id, pose, goodTaps, assisted: magnet })) {
      setMessage(`${joint.label}: tapped home!`);
      setChosen(null);
      focusAfter(['[data-testid="joint-part"]', '[data-testid="advance-stage"]']);
    }
  };

  return (
    <div className="ww-join">
      <ul className="ww-join__list" aria-label="Joints">
        {joints.map((entry) => {
          const record = Object.hasOwn(run.joints, entry.id) ? run.joints[entry.id] : undefined;
          return (
            <li
              key={entry.id}
              className={record === undefined ? "ww-join__item" : "ww-join__item ww-join__item--done"}
            >
              {record === undefined ? (
                <button
                  type="button"
                  className={
                    entry.id === joint?.id ? "ww-join__chip ww-join__chip--current" : "ww-join__chip"
                  }
                  onClick={() => setChosen(entry.id)}
                  aria-pressed={entry.id === joint?.id}
                >
                  {entry.label}
                </button>
              ) : (
                <span className="ww-join__chip ww-join__chip--done">
                  <Icon name="check" size={14} /> {entry.label} ·{" "}
                  {record.byApprentice ? "Ren tapped it home" : fitWord(record.accuracy)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch({ type: "resetJoint", jointId: entry.id })}
                    disabled={record.byApprentice}
                    aria-label={`Redo ${entry.label}`}
                  >
                    Redo
                  </Button>
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {joint !== undefined && tolerance !== null && woodId !== null ? (
        <div className="ww-join__table ww-paper">
          <div className="ww-join__head">
            <div>
              <span className="ad-eyebrow">{jointKindById(joint.kind).name}</span>
              <h2 className="ww-join__title">{joint.label}</h2>
            </div>
            <div className="ww-assist">
              <ToggleSwitch
                label="Magnet helper"
                description={`Pulls the part onto its shadow. Scores up to ${Math.round(ASSIST_JOINT_ACCURACY_CAP * 100)}%.`}
                checked={magnet}
                onChange={setMagnet}
              />
            </div>
          </div>
          <div className="ww-join__work">
            <JoinBench
              key={`${joint.id}-${run.id}-${tries}`}
              kind={joint.kind}
              woodId={woodId}
              targetAngle={target}
              tolerance={tolerance}
              startPose={jointStartPose(run.id, index, target)}
              taps={jointTaps(joint)}
              magnet={magnet}
              onSeat={seat}
              onHint={setMessage}
            />
            {look !== null ? (
              <figure className="ww-join__preview">
                <PiecePreview
                  look={look}
                  title="Where this joint goes"
                  highlight={highlight}
                  showExtras={false}
                />
                <figcaption>The glowing part is the one you are fitting.</figcaption>
              </figure>
            ) : null}
            {firstShow !== undefined && firstRecord !== undefined && firstShow.kind === joint.kind ? (
              <FirstJointCard
                kind={firstShow.kind}
                woodId={woodId}
                record={firstRecord}
                label={firstShow.label}
              />
            ) : null}
          </div>
          <div className="ww-join__foot">
            <Button
              variant="ghost"
              className="ww-big-button"
              onClick={() => {
                setTries((value) => value + 1);
                setMessage(null);
              }}
            >
              Start this joint again
            </Button>
            <p className="ww-join__message" role="status" aria-live="polite">
              {message ??
                "Drag the part onto its dashed shadow. Turn it with the round handle or the 1° buttons."}
            </p>
          </div>
        </div>
      ) : (
        <p className="ww-join__done ww-paper" role="status">
          <Icon name="check" size={20} /> Every joint is tapped home. It stands up by itself!
        </p>
      )}
      <RenHandOff {...props} job="pegs" />
      <StageFooter {...props} ready="All joints are snug. Time to sand!" />
    </div>
  );
}
