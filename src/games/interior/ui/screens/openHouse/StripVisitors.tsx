import type { AvatarLook } from "../../../../../engine/avatar";
import { Townsfolk, type TownsfolkPose } from "../../../../../ui/art/avatar/Townsfolk";
import { clampUnit, easeInOut, window01 } from "../../../../../ui/kit/easing";
import { runRoom, type MakeoverRun } from "../../../core";
import { cutawayFrame, floorPoint } from "../../art/cutawayFrame";
import { OpenHouseTreats } from "./OpenHouseTreats";
import { treatSpots } from "./treatSpots";
import { visitorSpots } from "./visitorSpots";

interface StripVisitorsProps {
  readonly run: MakeoverRun;
  readonly t: number;
  readonly still: boolean;
  readonly visitors: readonly AvatarLook[];
  readonly cloth: string;
}

const POSES: readonly TownsfolkPose[] = ["point", "clasp", "cheer", "mug", "photo", "wave"];
const VISITORS_IN_ROOM = 4;
const FIGURE = 250;
const BUBBLE_TOP = 64;
const INK = "#3b2a33";

function Reaction({ kind, size, wobble }: { kind: number; size: number; wobble: number }) {
  const s = size / 30;
  const icon = kind % 3;
  return (
    <g transform={`scale(${s.toFixed(3)}) rotate(${(wobble * 6).toFixed(1)})`}>
      <path
        d="M-24 -30 Q-24 -46 -8 -46 L8 -46 Q24 -46 24 -30 L24 -14 Q24 0 8 0 L4 0 L-4 10 L-6 0 L-8 0 Q-24 0 -24 -14 Z"
        fill="#fffdf9"
        stroke={INK}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      {icon === 0 ? (
        <path
          d="M0 -11 C-13 -20 -12 -33 0 -26 C12 -33 13 -20 0 -11 Z"
          fill="#e8546a"
          stroke="#7a2232"
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      ) : icon === 1 ? (
        <path
          d="M0 -37 L3.6 -27.6 L13.5 -27 L5.8 -20.6 L8.4 -11 L0 -16.4 L-8.4 -11 L-5.8 -20.6 L-13.5 -27 L-3.6 -27.6 Z"
          fill="#ffd95a"
          stroke="#b07f12"
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      ) : (
        <g>
          <rect x={-3.6} y={-39} width={7.2} height={19} rx={3.6} fill="#c8664a" />
          <circle cx={0} cy={-13.5} r={3.8} fill="#c8664a" />
        </g>
      )}
    </g>
  );
}

function RisingHearts({ t, size, seed }: { t: number; size: number; seed: number }) {
  return (
    <g>
      {[0, 1, 2].map((index) => {
        const phase = (t * 1.4 + index / 3 + seed * 0.17) % 1;
        const x = Math.sin(phase * 6 + index * 2 + seed) * size * 0.4 + (index - 1) * size * 0.3;
        const y = -phase * size * 2.2;
        const fade = Math.sin(phase * Math.PI);
        return (
          <path
            key={index}
            d="M0 4 C-7 -1 -6 -8 0 -4 C6 -8 7 -1 0 4 Z"
            transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(size / 22).toFixed(2)})`}
            fill={index === 1 ? "#f6a6b6" : "#e8546a"}
            opacity={(fade * 0.9).toFixed(2)}
          />
        );
      })}
    </g>
  );
}

export function StripVisitors({ run, t, still, visitors, cloth }: StripVisitorsProps) {
  const room = runRoom(run);
  const frame = cutawayFrame(room);
  const spots = visitorSpots(room, run.plan.pieces, Math.min(VISITORS_IN_ROOM, visitors.length));
  const treats = treatSpots(room, run.plan.pieces, spots);
  const door: readonly [number, number] = [room.doorCol + 1, room.rows - 0.4];
  const scale = (frame.cell * 2.25) / FIGURE;
  const centre = floorPoint(frame, room.cols / 2, room.rows / 2)[0];
  const placed = spots
    .map((spot, index) => {
      const raw = clampUnit(t * 3 - index * 0.12);
      const arrive = still ? 1 : easeInOut(raw);
      const col = door[0] + (spot[0] + 0.5 - door[0]) * arrive;
      const row = door[1] + (spot[1] + 0.55 - door[1]) * arrive;
      return { index, col, row, raw };
    })
    .sort((a, b) => a.row - b.row);
  return (
    <g pointerEvents="none">
      {placed.map(({ index, col, row, raw }) => {
        const look = visitors[index];
        if (look === undefined) return null;
        const [x, y] = floorPoint(frame, col, row);
        const walking = !still && raw < 0.8;
        const sway = still ? 0.4 : walking ? Math.sin(raw * 40 + index) : Math.sin(t * 7 + index * 1.7);
        const hop = walking ? Math.abs(Math.sin(raw * 40 + index)) * 6 : 0;
        const child = index === 2;
        const height = FIGURE * scale * (child ? 0.72 : 1);
        const flip = x > centre;
        const reacting = still || raw >= 0.5;
        return (
          <g key={index} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
            <ellipse
              cx={0}
              cy={0}
              rx={frame.cell * 0.34}
              ry={frame.cell * 0.09}
              fill="#2b2230"
              opacity={0.26}
            />
            <ellipse
              cx={0}
              cy={0}
              rx={frame.cell * 0.2}
              ry={frame.cell * 0.05}
              fill="#2b2230"
              opacity={0.22}
            />
            <g transform={`scale(${scale.toFixed(4)})`}>
              <Townsfolk
                look={look}
                pose={walking ? "stroll" : (POSES[index % POSES.length] ?? "wave")}
                mood={index % 2 === 0 ? "delighted" : "happy"}
                sway={sway}
                lift={hop}
                flip={flip}
                child={child}
              />
            </g>
            {reacting ? (
              <g opacity={still ? 1 : window01(raw, 0.5, 0.8)}>
                {y - height * 1.1 - frame.cell * 0.95 >= BUBBLE_TOP ? (
                  <g
                    transform={`translate(${((flip ? -1 : 1) * height * 0.3).toFixed(1)} ${(-height * 1.1 - (still ? 0 : Math.sin(t * 9 + index) * 3)).toFixed(1)})`}
                  >
                    <Reaction
                      kind={index}
                      size={frame.cell * 0.62}
                      wobble={still ? 0 : Math.sin(t * 6 + index)}
                    />
                  </g>
                ) : null}
                {index % 2 === 0 || still ? null : (
                  <g
                    transform={`translate(${((flip ? -1 : 1) * height * 0.32).toFixed(1)} ${(-height * 0.95).toFixed(1)})`}
                  >
                    <RisingHearts t={t} size={frame.cell * 0.3} seed={index} />
                  </g>
                )}
              </g>
            ) : null}
          </g>
        );
      })}
      <OpenHouseTreats
        frame={frame}
        table={treats.table}
        easel={treats.easel}
        cloth={cloth}
        shown={still ? 1 : window01(t, 0.05, 0.25)}
      />
    </g>
  );
}
