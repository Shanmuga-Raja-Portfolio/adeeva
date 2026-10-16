import type { CSSProperties } from "react";
import type { AvatarLook } from "../../../../../engine/avatar";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { clampUnit, easeInOut, easeOut, window01 } from "../../../../../ui/kit/easing";
import type { HomeStoryDef } from "../../../content/homeStory";
import { VISITOR_ECHOES } from "../../../content/visitor";
import type { Cell } from "../../../content/furniture";
import {
  glowPath,
  placedLights,
  runRoom,
  walkPath,
  walkThrough,
  type MakeoverRun,
  type PlacedDecor,
} from "../../../core";
import { cutawayFrame, floorPoint } from "../../art/cutawayFrame";
import { RoomCutaway } from "../../art/RoomCutaway";
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

function roomPath(run: MakeoverRun): readonly Cell[] {
  const room = runRoom(run);
  const toDoor = walkPath(room, run.plan.pieces);
  if (toDoor !== null) return toDoor;
  const reached = [...walkThrough(room, run.plan.pieces, 1).reached];
  return reached.map((key): Cell => {
    const [col, row] = key.split(",").map(Number);
    return [col ?? 0, row ?? 0];
  });
}

function along(path: readonly Cell[], progress: number): readonly [number, number] {
  if (path.length === 0) return [0, 0];
  const exact = clampUnit(progress) * (path.length - 1);
  const index = Math.floor(exact);
  const from = path[index] ?? path[0] ?? [0, 0];
  const to = path[Math.min(path.length - 1, index + 1)] ?? from;
  const share = exact - index;
  return [from[0] + (to[0] - from[0]) * share, from[1] + (to[1] - from[1]) * share];
}

function Visitors({
  run,
  t,
  still,
  visitors,
}: {
  run: MakeoverRun;
  t: number;
  still: boolean;
  visitors: readonly AvatarLook[];
}) {
  const room = runRoom(run);
  const frame = cutawayFrame(room);
  const path = roomPath(run);
  const height = frame.cell * 1.8;
  return (
    <g pointerEvents="none">
      {visitors.map((look, index) => {
        const raw = clampUnit(t * 1.3 - index * 0.09);
        const stop = Math.max(0.3, 1 - index * 0.12);
        const progress = still ? clampUnit(0.25 + index * 0.12) : stop * easeInOut(raw);
        const [col, row] = along(path, progress);
        const bob = still ? 0 : Math.abs(Math.sin(raw * 18 + index)) * frame.cell * 0.08;
        const spreadCol = ((index % 3) - 1) * 0.55;
        const spreadRow = Math.floor(index / 3) * 0.5 - 0.1;
        const [x, y] = floorPoint(frame, col + 0.5 + spreadCol, row + 0.62 + spreadRow);
        return (
          <g
            key={index}
            transform={`translate(${(x - height / 4).toFixed(1)} ${(y - height - bob).toFixed(1)})`}
          >
            <Avatar look={look} variant="full" size={height} mood="delighted" title="Visitor" />
          </g>
        );
      })}
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
  const below = first.item.y + 92 <= 420;
  const y = below ? Math.min(420 - 48, first.item.y + 44) : Math.max(10, first.item.y - 96);
  const tail = below ? y : y + 40;
  const tip = below ? y - 14 : y + 54;
  return (
    <g pointerEvents="none" opacity={shown} data-testid="story-bubble">
      <circle cx={first.item.x} cy={first.item.y} r={26} fill="#fff4c2" opacity={0.6} />
      <path
        d={`M${first.item.x - 6} ${first.item.y - 30} l6 -6 l6 6 l-6 6 Z`}
        fill="#ffffff"
        transform={`rotate(${(t * 360).toFixed(0)} ${first.item.x} ${first.item.y - 30})`}
      />
      <rect x={x} y={y} width={width} height={40} rx={18} fill="#fffdf9" stroke="#3b2a33" strokeWidth={2} />
      <path
        d={`M${first.item.x - 8} ${tail} L${first.item.x} ${tip} L${first.item.x + 8} ${tail} Z`}
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
                        <GlowSteps run={entry.run} t={t} still={still} />
                        <Visitors run={entry.run} t={t} still={still} visitors={visitors} />
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
