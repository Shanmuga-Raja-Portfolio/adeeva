import type { ReactNode } from "react";
import { DOLL_WIDTH } from "./Croquis";
import { useSvgId } from "../useSvgId";

export type AvatarPose =
  | "rest"
  | "poised"
  | "poised-right"
  | "cheer"
  | "wave"
  | "graceful"
  | "graceful-right"
  | "present"
  | "point"
  | "chat"
  | "talk";

interface ArmBend {
  readonly shoulder: number;
  readonly elbow: number;
}

interface PoseAngles {
  readonly left: ArmBend;
  readonly right: ArmBend;
}

const SHOULDER = { x: 136, y: 180 };
const ELBOW = { x: 125.5, y: 293 };
const JOINT_RADIUS = 7.6;
const JOINT_SPREAD = 1.32;
const MID = DOLL_WIDTH / 2;

const HAND_ON_HIP: ArmBend = { shoulder: 36, elbow: -98 };
const RELAXED: ArmBend = { shoulder: 10, elbow: -16 };
const LOOSE: ArmBend = { shoulder: 6, elbow: -9 };
const SWAY: ArmBend = { shoulder: 15, elbow: -30 };
const WAVE: ArmBend = { shoulder: 42, elbow: 138 };
const OFFER: ArmBend = { shoulder: 30, elbow: 36 };
const REACH: ArmBend = { shoulder: 62, elbow: 14 };
const TALK: ArmBend = { shoulder: 22, elbow: 112 };

const POSES: Readonly<Record<Exclude<AvatarPose, "rest">, PoseAngles>> = {
  poised: { left: HAND_ON_HIP, right: RELAXED },
  "poised-right": { left: RELAXED, right: HAND_ON_HIP },
  cheer: { left: HAND_ON_HIP, right: WAVE },
  wave: { left: SWAY, right: WAVE },
  graceful: { left: SWAY, right: LOOSE },
  "graceful-right": { left: LOOSE, right: SWAY },
  present: { left: HAND_ON_HIP, right: OFFER },
  point: { left: SWAY, right: REACH },
  chat: { left: HAND_ON_HIP, right: TALK },
  talk: { left: SWAY, right: TALK },
};

interface SideProps {
  readonly side: "left" | "right";
  readonly bend: ArmBend;
  readonly idBase: string;
  readonly children: ReactNode;
}

function PosedSide({ side, bend, idBase, children }: SideProps) {
  const sign = side === "left" ? 1 : -1;
  const shoulderX = side === "left" ? SHOULDER.x : DOLL_WIDTH - SHOULDER.x;
  const elbowX = side === "left" ? ELBOW.x : DOLL_WIDTH - ELBOW.x;
  const x = side === "left" ? -MID : MID;
  const id = `${idBase}-${side}`;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-upper`}>
          <rect x={x} y={-400} width={DOLL_WIDTH} height={ELBOW.y + 400} />
        </clipPath>
        <clipPath id={`${id}-lower`}>
          <rect x={x} y={ELBOW.y} width={DOLL_WIDTH} height={1200} />
        </clipPath>
        <clipPath id={`${id}-joint`}>
          <circle cx={elbowX} cy={ELBOW.y} r={JOINT_RADIUS} />
        </clipPath>
      </defs>
      <g transform={`rotate(${sign * bend.shoulder} ${shoulderX} ${SHOULDER.y})`}>
        <g clipPath={`url(#${id}-upper)`}>{children}</g>
        <g transform={`rotate(${(sign * bend.elbow) / 2} ${elbowX} ${ELBOW.y})`}>
          <g clipPath={`url(#${id}-joint)`}>
            <g
              transform={`translate(${elbowX} ${ELBOW.y}) scale(${JOINT_SPREAD} 1) translate(${-elbowX} ${-ELBOW.y})`}
            >
              {children}
            </g>
          </g>
        </g>
        <g transform={`rotate(${sign * bend.elbow} ${elbowX} ${ELBOW.y})`}>
          <g clipPath={`url(#${id}-lower)`}>{children}</g>
        </g>
      </g>
    </g>
  );
}

export function PosedArms({ pose, children }: { pose: AvatarPose; children: ReactNode }) {
  const idBase = useSvgId("pose");
  if (pose === "rest") return <g className="ad-arm-pose">{children}</g>;
  const angles = POSES[pose];
  return (
    <g className={`ad-arm-pose ad-arm-pose--${pose}`}>
      <PosedSide side="left" bend={angles.left} idBase={idBase}>
        {children}
      </PosedSide>
      <PosedSide side="right" bend={angles.right} idBase={idBase}>
        {children}
      </PosedSide>
    </g>
  );
}
