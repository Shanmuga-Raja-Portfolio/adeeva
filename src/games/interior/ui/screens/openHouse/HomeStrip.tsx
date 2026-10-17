import type { CSSProperties } from "react";
import type { AvatarLook } from "../../../../../engine/avatar";
import type { AvatarPose } from "../../../../../ui/art/avatar/ArmPose";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { clampUnit, easeInOut, easeOut, window01 } from "../../../../../ui/kit/easing";
import type { HomeStoryDef } from "../../../content/homeStory";
import { VISITOR_ECHOES } from "../../../content/visitor";
import { glowPath, placedLights, runRoom, type MakeoverRun, type PlacedDecor } from "../../../core";
import { cutawayFrame, floorPoint } from "../../art/cutawayFrame";
import { RoomCutaway } from "../../art/RoomCutaway";
import { roomHex } from "../../art/roomHex";
import { PartyBunting } from "./PartyBunting";
import { OpenHouseTreats } from "./OpenHouseTreats";
import { treatSpots } from "./treatSpots";
import { visitorSpots } from "./visitorSpots";
import { BARE, FINISHED, roomLook } from "../../art/roomLook";

export interface StripRoom {
  readonly run: MakeoverRun;
  readonly label: string;
}

interface HomeStripProps {
  readonly rooms: readonly StripRoom[];
  readonly focus: number;
  readonly t: number;
  readonly still: boolean;
  readonly evening: boolean;
  readonly finale: boolean;
  readonly reveal: number;
  readonly visitors: readonly AvatarLook[];
  readonly story: HomeStoryDef;
}

const POSES: readonly AvatarPose[] = ["point", "cheer", "chat", "wave", "graceful"];
const VISITORS_IN_ROOM = 4;
const BUILD = 1.24;

function Reaction({ x, y, kind, size }: { x: number; y: number; kind: number; size: number }) {
  const scale = size / 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale.toFixed(2)})`}>
      <circle r={10} fill="#fffaf2" opacity={0.85} />
      {kind % 2 === 0 ? (
        <path
          d="M0 5 C-8 -1 -7 -9 0 -4.5 C7 -9 8 -1 0 5 Z"
          fill="#e8546a"
          stroke="#7a2232"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M0 -8 L2.2 -2.2 L8 0 L2.2 2.2 L0 8 L-2.2 2.2 L-8 0 L-2.2 -2.2 Z"
          fill="#ffd95a"
          stroke="#b07f12"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      )}
    </g>
  );
}

function Visitors({
  run,
  t,
  still,
  visitors,
  cloth,
}: {
  run: MakeoverRun;
  t: number;
  still: boolean;
  visitors: readonly AvatarLook[];
  cloth: string;
}) {
  const room = runRoom(run);
  const frame = cutawayFrame(room);
  const spots = visitorSpots(room, run.plan.pieces, Math.min(VISITORS_IN_ROOM, visitors.length));
  const treats = treatSpots(room, run.plan.pieces, spots);
  const door: readonly [number, number] = [room.doorCol + 1, room.rows - 0.4];
  const height = frame.cell * 2;
  const placed = spots
    .map((spot, index) => {
      const raw = clampUnit(t * 2.2 - index * 0.12);
      const arrive = still ? 1 : easeInOut(raw);
      const col = door[0] + (spot[0] + 0.5 - door[0]) * arrive;
      const row = door[1] + (spot[1] + 0.55 - door[1]) * arrive;
      return { index, col, row, arrive, raw };
    })
    .sort((a, b) => a.row - b.row);
  return (
    <g pointerEvents="none">
      {placed.map(({ index, col, row, arrive, raw }) => {
        const look = visitors[index];
        if (look === undefined) return null;
        const [x, y] = floorPoint(frame, col, row);
        const bob = still || arrive >= 1 ? 0 : Math.abs(Math.sin(raw * 18 + index)) * frame.cell * 0.08;
        const flip = index % 2 === 1 ? -1 : 1;
        return (
          <g key={index} transform={`translate(${x.toFixed(1)} ${(y - bob).toFixed(1)})`}>
            <ellipse cx={0} cy={0} rx={height * 0.2} ry={height * 0.05} fill="#2b2230" opacity={0.22} />
            <g
              transform={`rotate(${((index % 3) - 1) * 3}) scale(${flip * BUILD} 1) translate(${(-height / 4).toFixed(1)} ${(-height).toFixed(1)})`}
            >
              <Avatar
                look={look}
                variant="full"
                size={height}
                mood={index % 3 === 0 ? "delighted" : "happy"}
                pose={POSES[index % POSES.length]}
                title="Visitor"
              />
            </g>
            {still || raw >= 0.5 ? (
              <g opacity={still ? 1 : window01(raw, 0.5, 0.8)}>
                <Reaction
                  x={height * 0.2}
                  y={-height * 1.06 - (still ? 0 : Math.sin(t * 9 + index) * frame.cell * 0.06)}
                  kind={index}
                  size={frame.cell * 0.42}
                />
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

function GlowSteps({ run, t, still }: { run: MakeoverRun; t: number; still: boolean }) {
  const room = runRoom(run);
  const glow = glowPath(room, run.plan.pieces, placedLights(run));
  if (glow === null) return null;
  const frame = cutawayFrame(room);
  const shown = still ? 1 : easeOut(window01(t, 0.18, 0.5));
  return (
    <g pointerEvents="none" opacity={shown}>
      {glow.cells.map(([col, row], index) => {
        const [x, y] = floorPoint(frame, col + 0.5, row + 0.5);
        return (
          <ellipse
            key={`${col}-${row}`}
            cx={x}
            cy={y}
            rx={frame.cell * 0.34}
            ry={frame.depth * 0.34}
            fill={glow.lit[index] === true ? "#ffe39c" : "#ffffff"}
            opacity={glow.lit[index] === true ? 0.7 : 0.25}
          />
        );
      })}
    </g>
  );
}

function storyLine(run: MakeoverRun, story: HomeStoryDef): { item: PlacedDecor; line: string } | null {
  const items = run.decor.flatMap((item) => {
    const piece = story.pieces.find((entry) => entry.decorId === item.decorId);
    return piece === undefined ? [] : [{ item, line: piece.line }];
  });
  return items[0] ?? null;
}

function StoryBubbles({
  run,
  earlier,
  t,
  still,
  story,
}: {
  run: MakeoverRun;
  earlier: readonly MakeoverRun[];
  t: number;
  still: boolean;
  story: HomeStoryDef;
}) {
  const shown = still ? 1 : easeOut(window01(t, 0.35, 0.45)) * (1 - window01(t, 0.88, 0.98));
  if (shown <= 0) return null;
  const found = storyLine(run, story);
  if (found === null) return null;
  const repeats = earlier.filter((other) => storyLine(other, story)?.line === found.line).length;
  const first = {
    item: found.item,
    line: repeats === 0 ? found.line : (VISITOR_ECHOES[(repeats - 1) % VISITOR_ECHOES.length] ?? found.line),
  };
  const width = Math.min(600, Math.max(160, first.line.length * 9 + 28));
  const x = Math.min(640 - width - 8, Math.max(8, first.item.x - width / 2));
  const y = 6;
  const tail = y + 40;
  const tip = y + 54;
  const tailX = Math.min(x + width - 24, Math.max(x + 24, first.item.x));
  return (
    <g pointerEvents="none" opacity={shown} data-testid="story-bubble">
      <circle
        cx={first.item.x}
        cy={first.item.y}
        r={28}
        fill="none"
        stroke="#f6c94c"
        strokeWidth={3}
        strokeDasharray="6 5"
        opacity={0.9}
      />
      <path
        d={`M${first.item.x - 6} ${first.item.y - 30} l6 -6 l6 6 l-6 6 Z`}
        fill="#ffffff"
        transform={`rotate(${(t * 360).toFixed(0)} ${first.item.x} ${first.item.y - 30})`}
      />
      <rect x={x} y={y} width={width} height={40} rx={18} fill="#fffdf9" stroke="#3b2a33" strokeWidth={2} />
      <path
        d={`M${tailX - 8} ${tail - 1} L${tailX} ${tip} L${tailX + 8} ${tail - 1} Z`}
        fill="#fffdf9"
        stroke="#3b2a33"
        strokeWidth={2}
      />
      <text x={x + width / 2} y={y + 25} textAnchor="middle" className="is-strip__bubble-text">
        {first.line}
      </text>
    </g>
  );
}

export function HomeStrip({
  rooms,
  focus,
  t,
  still,
  evening,
  finale,
  reveal,
  visitors,
  story,
}: HomeStripProps) {
  const lightsOn = still ? 1 : easeOut(window01(t, 0.04, 0.3));
  const style = { "--strip-rooms": rooms.length, "--strip-focus": focus } as CSSProperties;
  return (
    <div className={finale ? "is-strip is-strip--finale" : "is-strip"} style={style} data-testid="home-strip">
      <div className="is-strip__track">
        {rooms.map((entry, index) => {
          const current = index === focus;
          const visible = finale || Math.abs(index - focus) <= 1;
          return (
            <figure
              key={entry.run.id}
              className={current ? "is-strip__room is-strip__room--current" : "is-strip__room"}
            >
              {visible ? (
                <div className="is-strip__frame">
                  <RoomCutaway
                    look={roomLook(entry.run, FINISHED)}
                    title={entry.label}
                    evening={evening}
                    className="is-strip__cutaway"
                  >
                    {current && !finale ? (
                      <>
                        <rect
                          width={640}
                          height={420}
                          fill="#141026"
                          opacity={0.55 * (1 - lightsOn)}
                          pointerEvents="none"
                        />
                        <PartyBunting
                          frame={cutawayFrame(runRoom(entry.run))}
                          colours={story.palette.map((colour) => roomHex(colour))}
                          shown={lightsOn}
                        />
                        <GlowSteps run={entry.run} t={t} still={still} />
                        <Visitors
                          run={entry.run}
                          t={t}
                          still={still}
                          visitors={visitors}
                          cloth={roomHex(story.palette[1] ?? story.palette[0] ?? "ivory")}
                        />
                        <StoryBubbles
                          run={entry.run}
                          earlier={rooms.slice(0, index).map((other) => other.run)}
                          t={t}
                          still={still}
                          story={story}
                        />
                      </>
                    ) : null}
                  </RoomCutaway>
                  {finale ? (
                    <div
                      className="is-strip__before"
                      style={{ clipPath: `inset(0 0 0 ${(reveal * 100).toFixed(1)}%)` }}
                    >
                      <RoomCutaway
                        look={roomLook(entry.run, BARE)}
                        title={`${entry.label} before`}
                        className="is-strip__cutaway"
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
              <figcaption className="is-strip__label">{entry.label}</figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
