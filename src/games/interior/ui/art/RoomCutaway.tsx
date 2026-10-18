import type { ReactNode } from "react";
import { darken, lighten } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { RoomTemplate } from "../../content/roomTemplate";
import {
  furnitureById,
  lightById,
  pieceCells,
  roomById,
  type PlacedLight,
  type PlacedPiece,
} from "../../core";
import { CutawayFloor } from "./CutawayFloor";
import { Cornice, FloorShading, ShellDefs, WallCaps, WallShading, WallSocket } from "./CutawayShell";
import {
  CUTAWAY_HEIGHT,
  CUTAWAY_WIDTH,
  cutawayFrame,
  floorPoint,
  floorQuad,
  lifted,
  pointsAttr,
  type CutawayFrame,
} from "./cutawayFrame";
import { DecorArt } from "./DecorArt";
import { FurnitureSprite } from "./FurnitureSprite";
import { lampHead } from "./lampHead";
import { BloomDefs, LightBloom } from "./LightBloom";
import { LightFixture } from "./LightFixture";
import { BARE_WALL, roomHex } from "./roomHex";
import type { RoomLook } from "./roomLook";
import { DressingDefs, RoomDressing } from "./RoomDressing";
import { ShowStaging, StagingDefs } from "./ShowStaging";
import { WindowDrapes } from "./WindowDrapes";

interface RoomCutawayProps {
  readonly look: RoomLook;
  readonly title: string;
  readonly className?: string | undefined;
  readonly evening?: boolean | undefined;
  readonly staging?: StagingLook | undefined;
  readonly children?: ReactNode;
}

export interface StagingLook {
  readonly palette: readonly string[];
  readonly extras?: boolean | undefined;
}

const WINDOW_TOP = 0.8;
const LOWER_SHARE = 0.4;
const WINDOW_BOTTOM = 0.36;

function bounds(piece: PlacedPiece) {
  const cells = pieceCells(piece);
  const cols = cells.map((cell) => cell[0]);
  const rows = cells.map((cell) => cell[1]);
  return {
    left: Math.min(...cols),
    right: Math.max(...cols) + 1,
    back: Math.min(...rows),
    front: Math.max(...rows) + 1,
  };
}

function BackWindow({ frame, from, to, id }: { frame: CutawayFrame; from: number; to: number; id: string }) {
  const [x1] = floorPoint(frame, from + 0.15, 0);
  const [x2] = floorPoint(frame, to - 0.15, 0);
  const top = frame.oy - frame.wall * WINDOW_TOP;
  const bottom = frame.oy - frame.wall * WINDOW_BOTTOM;
  const line = Math.max(1.5, frame.scale * 3);
  return (
    <g>
      <rect
        x={x1}
        y={top}
        width={x2 - x1}
        height={bottom - top}
        fill={`url(#${id}-sky)`}
        stroke="#fffaf2"
        strokeWidth={line * 1.6}
      />
      <circle
        cx={x2 - (x2 - x1) * 0.25}
        cy={top + (bottom - top) * 0.3}
        r={(bottom - top) * 0.12}
        fill="#fff4c2"
      />
      <path
        d={`M${x1 + (x2 - x1) * 0.1} ${bottom - (bottom - top) * 0.22} q${(x2 - x1) * 0.15} ${-(bottom - top) * 0.2} ${(x2 - x1) * 0.3} 0`}
        fill="#ffffff"
        opacity={0.8}
      />
      <path
        d={`M${(x1 + x2) / 2} ${top} L${(x1 + x2) / 2} ${bottom} M${x1} ${(top + bottom) / 2} L${x2} ${(top + bottom) / 2}`}
        stroke="#fffaf2"
        strokeWidth={line}
      />
      <rect
        x={x1 - line * 2}
        y={bottom}
        width={x2 - x1 + line * 4}
        height={line * 2.2}
        rx={line}
        fill="#fffaf2"
        stroke="#3b2a33"
        strokeWidth={line * 0.4}
      />
    </g>
  );
}

function Sunbeam({ frame, from, to }: { frame: CutawayFrame; from: number; to: number }) {
  const [x1] = floorPoint(frame, from + 0.15, 0);
  const [x2] = floorPoint(frame, to - 0.15, 0);
  const bottom = frame.oy - frame.wall * WINDOW_BOTTOM;
  const reach = Math.min(frame.rows, 2.6);
  const near1 = floorPoint(frame, from + 0.7, reach);
  const near2 = floorPoint(frame, to + 0.5, reach);
  return (
    <polygon points={pointsAttr([[x1, bottom], [x2, bottom], near2, near1])} fill="#f6d77a" opacity={0.22} />
  );
}

function SideWindow({ frame, from, to, id }: { frame: CutawayFrame; from: number; to: number; id: string }) {
  const line = Math.max(1.5, frame.scale * 3);
  const a = floorPoint(frame, 0, from + 0.15);
  const b = floorPoint(frame, 0, to - 0.15);
  const quad = [
    lifted(a, frame.wall * WINDOW_TOP),
    lifted(b, frame.wall * WINDOW_TOP),
    lifted(b, frame.wall * WINDOW_BOTTOM),
    lifted(a, frame.wall * WINDOW_BOTTOM),
  ];
  return (
    <polygon points={pointsAttr(quad)} fill={`url(#${id}-sky)`} stroke="#fffaf2" strokeWidth={line * 1.6} />
  );
}

function RoofWindow({ frame, id }: { frame: CutawayFrame; id: string }) {
  const left = frame.ox;
  const right = frame.ox + frame.cols * frame.cell;
  const top = frame.oy - frame.wall;
  const slope = frame.wall * 0.24;
  const midX = (left + right) / 2;
  const glass = [
    [midX - frame.cell * 0.9, top + slope * 0.2],
    [midX + frame.cell * 0.9, top + slope * 0.2],
    [midX + frame.cell * 0.8, top + slope * 0.85],
    [midX - frame.cell * 0.8, top + slope * 0.85],
  ] as const;
  return (
    <g>
      <polygon
        points={pointsAttr([
          [left, top],
          [right, top],
          [right, top + slope],
          [left, top + slope],
        ])}
        fill="#efe3d3"
        stroke="#3b2a33"
        strokeWidth={1}
        opacity={0.95}
      />
      <polygon
        points={pointsAttr(glass)}
        fill={`url(#${id}-night)`}
        stroke="#fffaf2"
        strokeWidth={Math.max(1.5, frame.scale * 3)}
      />
      {[0.3, 0.55, 0.75].map((share) => (
        <circle
          key={share}
          cx={midX - frame.cell * 0.6 + share * frame.cell * 1.2}
          cy={top + slope * (0.35 + share * 0.3)}
          r={1.6}
          fill="#fff4c2"
        />
      ))}
    </g>
  );
}

function Glow({ frame, light, id }: { frame: CutawayFrame; light: PlacedLight; id: string }) {
  const def = lightById(light.lightId);
  const [cx, cy] = floorPoint(frame, light.col + 0.5, light.row + 0.5);
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={def.radius * frame.cell * 0.72 * def.strength}
      ry={def.radius * frame.depth * 0.9 * def.strength}
      fill={`url(#${id}-${def.warmth})`}
    />
  );
}

function mirrored(frame: CutawayFrame, lights: readonly PlacedLight[], light: PlacedLight): boolean {
  if (lightById(light.lightId).mount !== "floor") return false;
  const across = (other: PlacedLight) =>
    (other.col - light.col) * frame.cell - (other.row - light.row) * frame.shift;
  return lights.some(
    (other) =>
      other !== light &&
      lightById(other.lightId).mount === "floor" &&
      Math.abs(other.col - light.col) <= 1 &&
      Math.abs(other.row - light.row) <= 1 &&
      (across(other) > 0 || (across(other) === 0 && other.row > light.row)),
  );
}

function fixtureSpot(frame: CutawayFrame, room: RoomTemplate, light: PlacedLight) {
  const mount = lightById(light.lightId).mount;
  const centre = floorPoint(frame, light.col + 0.5, light.row + 0.5);
  if (mount === "ceiling") return { point: lifted(centre, frame.wall * 0.62), drop: frame.wall * 0.38 };
  if (mount === "floor") return { point: floorPoint(frame, light.col + 0.5, light.row + 0.8), drop: 0 };
  if (mount === "desk")
    return { point: lifted(floorPoint(frame, light.col + 0.5, light.row + 0.8), frame.cell * 1.02), drop: 0 };
  if (light.row === 0)
    return { point: lifted(floorPoint(frame, light.col + 0.5, 0), frame.wall * 0.6), drop: 0 };
  if (light.col === 0)
    return { point: lifted(floorPoint(frame, 0, light.row + 0.5), frame.wall * 0.6), drop: 0 };
  return { point: lifted(floorPoint(frame, room.cols, light.row + 0.5), frame.wall * 0.6), drop: 0 };
}

export function RoomCutaway({
  look,
  title,
  className,
  evening = false,
  staging,
  children,
}: RoomCutawayProps) {
  const id = useSvgId("is-room");
  const room = roomById(look.roomId);
  const frame = cutawayFrame(room);
  const back = look.backWall ?? BARE_WALL;
  const side = look.sideWall ?? BARE_WALL;
  const backQuad = [
    lifted(floorPoint(frame, 0, 0), frame.wall),
    lifted(floorPoint(frame, room.cols, 0), frame.wall),
    floorPoint(frame, room.cols, 0),
    floorPoint(frame, 0, 0),
  ];
  const sideQuad = [
    lifted(floorPoint(frame, 0, room.rows), frame.wall),
    lifted(floorPoint(frame, 0, 0), frame.wall),
    floorPoint(frame, 0, 0),
    floorPoint(frame, 0, room.rows),
  ];
  const front = [floorPoint(frame, 0, room.rows), floorPoint(frame, room.cols, room.rows)];
  const lip = frame.depth * 0.45;
  const pieces = [...look.pieces].sort(
    (a, b) => bounds(a).front - bounds(b).front || bounds(a).left - bounds(b).left,
  );
  const standing = look.lights.filter((light) => {
    const mount = lightById(light.lightId).mount;
    return mount === "floor" || mount === "desk";
  });
  const hanging = look.lights.filter((light) => !standing.includes(light));
  const props = [
    ...pieces.map((piece) => ({ key: piece.id, front: bounds(piece).front - 0.01, piece, light: null })),
    ...standing.map((light, index) => ({ key: `light-${index}`, front: light.row + 1, piece: null, light })),
  ].sort((a, b) => a.front - b.front);
  return (
    <svg
      className={className}
      viewBox={`0 0 ${CUTAWAY_WIDTH} ${CUTAWAY_HEIGHT}`}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fc4ea" />
          <stop offset="1" stopColor="#d9eefa" />
        </linearGradient>
        <linearGradient id={`${id}-night`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22305a" />
          <stop offset="1" stopColor="#5e5a8c" />
        </linearGradient>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.18} />
          <stop offset="1" stopColor="#000000" stopOpacity={0.06} />
        </linearGradient>
        <radialGradient id={`${id}-warm`}>
          <stop offset="0" stopColor="#ffd98a" stopOpacity={0.55} />
          <stop offset="0.5" stopColor="#f7c25e" stopOpacity={0.22} />
          <stop offset="1" stopColor="#f7c25e" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-cool`}>
          <stop offset="0" stopColor="#e3f6ff" stopOpacity={0.5} />
          <stop offset="0.5" stopColor="#bfe6ff" stopOpacity={0.2} />
          <stop offset="1" stopColor="#bfe6ff" stopOpacity={0} />
        </radialGradient>
        <ShellDefs id={id} />
        <BloomDefs id={id} />
        <DressingDefs id={id} back={back} />
        {staging === undefined ? null : <StagingDefs id={id} />}
      </defs>
      <ellipse
        cx={CUTAWAY_WIDTH / 2}
        cy={CUTAWAY_HEIGHT - 18}
        rx={CUTAWAY_WIDTH * 0.46}
        ry={14}
        fill="#2b2230"
        opacity={0.12}
      />
      <polygon points={pointsAttr(backQuad)} fill={back} />
      <polygon
        points={pointsAttr(backQuad)}
        fill={`url(#${id}-wall)`}
        stroke={darken(back, 0.4)}
        strokeWidth={1.5}
      />
      {look.backLower === null ? null : (
        <g data-testid="two-tone-band">
          <polygon
            points={pointsAttr([
              lifted(floorPoint(frame, 0, 0), frame.wall * LOWER_SHARE),
              lifted(floorPoint(frame, room.cols, 0), frame.wall * LOWER_SHARE),
              floorPoint(frame, room.cols, 0),
              floorPoint(frame, 0, 0),
            ])}
            fill={look.backLower}
            stroke={darken(look.backLower, 0.4)}
            strokeWidth={1.5}
          />
          <path
            d={`M${pointsAttr([lifted(floorPoint(frame, 0, 0), frame.wall * LOWER_SHARE)])} L${pointsAttr([lifted(floorPoint(frame, room.cols, 0), frame.wall * LOWER_SHARE)])}`}
            stroke="#fffaf2"
            strokeWidth={Math.max(2, frame.scale * 5)}
          />
        </g>
      )}
      <WallShading frame={frame} id={id} />
      <polygon points={pointsAttr(sideQuad)} fill={darken(side, 0.1)} />
      <polygon
        points={pointsAttr(sideQuad)}
        fill={`url(#${id}-wall)`}
        stroke={darken(side, 0.45)}
        strokeWidth={1.5}
      />
      <RoomDressing
        frame={frame}
        room={room}
        back={back}
        side={side}
        panelled={look.backWall !== null && look.backLower === null}
        id={id}
      />
      {room.windows.map((window) =>
        window.wall === "back" ? (
          <BackWindow key={`b${window.from}`} frame={frame} from={window.from} to={window.to} id={id} />
        ) : (
          <SideWindow key={`s${window.from}`} frame={frame} from={window.from} to={window.to} id={id} />
        ),
      )}
      {look.pieces.length > 0
        ? room.windows
            .filter((window) => window.wall === "back")
            .map((window) => (
              <WindowDrapes
                key={`drape${window.from}`}
                frame={frame}
                from={window.from}
                to={window.to}
                top={frame.oy - frame.wall * WINDOW_TOP}
                bottom={frame.oy - frame.wall * WINDOW_BOTTOM}
                fabric={look.soft}
              />
            ))
        : null}
      <Cornice frame={frame} back={back} side={side} id={id} />
      {room.roofWindow ? <RoofWindow frame={frame} id={id} /> : null}
      <polygon
        points={pointsAttr([
          floorPoint(frame, 0, 0),
          floorPoint(frame, room.cols, 0),
          lifted(floorPoint(frame, room.cols, 0), frame.wall * 0.05),
          lifted(floorPoint(frame, 0, 0), frame.wall * 0.05),
        ])}
        fill={lighten(back, 0.55)}
        stroke={darken(back, 0.35)}
        strokeWidth={1}
      />
      <polygon
        points={pointsAttr([
          floorPoint(frame, 0, room.rows),
          floorPoint(frame, 0, 0),
          lifted(floorPoint(frame, 0, 0), frame.wall * 0.05),
          lifted(floorPoint(frame, 0, room.rows), frame.wall * 0.05),
        ])}
        fill={lighten(side, 0.45)}
        stroke={darken(side, 0.35)}
        strokeWidth={1}
      />
      <WallSocket frame={frame} />
      <CutawayFloor frame={frame} floorId={look.floor} />
      <FloorShading frame={frame} id={id} />
      {room.windows
        .filter((window) => window.wall === "back")
        .map((window) => (
          <Sunbeam key={`beam${window.from}`} frame={frame} from={window.from} to={window.to} />
        ))}
      <polygon
        points={pointsAttr(floorQuad(frame, room.doorCol + 0.15, room.rows - 0.75, 1.7, 0.6))}
        fill="#c8664a"
        opacity={0.8}
      />
      <polygon
        points={pointsAttr([
          front[0] ?? [0, 0],
          front[1] ?? [0, 0],
          lifted(front[1] ?? [0, 0], -lip),
          lifted(front[0] ?? [0, 0], -lip),
        ])}
        fill="#8a6a52"
        stroke="#3b2a33"
        strokeWidth={1.5}
      />
      <WallCaps frame={frame} back={back} side={side} id={id} />
      {staging === undefined ? null : (
        <ShowStaging
          frame={frame}
          room={room}
          pieces={look.pieces}
          palette={staging.palette}
          id={id}
          extras={staging.extras}
        />
      )}
      {evening ? (
        <polygon
          points={pointsAttr([
            ...backQuad.slice(0, 2),
            floorPoint(frame, room.cols, 0),
            floorPoint(frame, room.cols, room.rows),
            floorPoint(frame, 0, room.rows),
            sideQuad[0] ?? [0, 0],
          ])}
          fill="#1d2140"
          opacity={0.42}
        />
      ) : null}
      {look.lights.map((light, index) => (
        <Glow key={`glow-${index}`} frame={frame} light={light} id={id} />
      ))}
      {pieces.map((piece) => {
        const box = bounds(piece);
        const [cx, cy] = floorPoint(frame, (box.left + box.right) / 2, (box.back + box.front) / 2);
        return (
          <g key={`shadow-${piece.id}`}>
            <polygon
              points={pointsAttr(
                floorQuad(
                  frame,
                  box.left + 0.05,
                  box.back + 0.05,
                  box.right - box.left - 0.1,
                  box.front - box.back - 0.1,
                ),
              )}
              fill="#2b2230"
              opacity={0.12}
            />
            <ellipse
              cx={cx}
              cy={cy}
              rx={(box.right - box.left) * frame.cell * 0.62}
              ry={(box.front - box.back) * frame.depth * 0.75}
              fill={`url(#${id}-contact)`}
            />
          </g>
        );
      })}
      {props.map((entry) => {
        if (entry.piece !== null) {
          const box = bounds(entry.piece);
          const def = furnitureById(entry.piece.furnitureId);
          const [x, y] = floorPoint(frame, (box.left + box.right) / 2, box.front - 0.15);
          return (
            <FurnitureSprite
              key={entry.key}
              furnitureId={entry.piece.furnitureId}
              x={x}
              y={y}
              width={(box.right - box.left) * frame.cell * 0.92}
              unit={frame.cell}
              fill={def.colour === "soft" ? look.soft : roomHex(def.colour)}
              soft={look.soft}
            />
          );
        }
        if (entry.light === null) return null;
        const spot = fixtureSpot(frame, room, entry.light);
        return (
          <g
            key={entry.key}
            transform={
              mirrored(frame, look.lights, entry.light)
                ? `translate(${(spot.point[0] * 2).toFixed(1)} 0) scale(-1 1)`
                : undefined
            }
          >
            <LightFixture
              lightId={entry.light.lightId}
              x={spot.point[0]}
              y={spot.point[1]}
              unit={frame.cell}
            />
          </g>
        );
      })}
      {hanging.map((light, index) => {
        const spot = fixtureSpot(frame, room, light);
        return (
          <LightFixture
            key={`hang-${index}`}
            lightId={light.lightId}
            x={spot.point[0]}
            y={spot.point[1]}
            unit={frame.cell}
            drop={spot.drop}
          />
        );
      })}
      <LightBloom
        id={id}
        unit={frame.cell}
        spots={look.lights.map((light) => {
          const def = lightById(light.lightId);
          const spot = fixtureSpot(frame, room, light);
          const head = lampHead(light.lightId, spot.point[0], spot.point[1], frame.cell);
          return {
            point: mirrored(frame, look.lights, light)
              ? ([spot.point[0] * 2 - head[0], head[1]] as const)
              : head,
            warm: def.warmth === "warm",
            wall: def.mount === "wall",
            strength: def.strength,
          };
        })}
      />
      {[...look.decor]
        .sort((a, b) => a.layer - b.layer)
        .map((item) => (
          <g
            key={item.id}
            transform={`translate(${item.x} ${item.y}) rotate(${item.rotation}) scale(${item.scale})`}
          >
            <DecorArt decorId={item.decorId} soft={look.soft} />
          </g>
        ))}
      {children}
    </svg>
  );
}
