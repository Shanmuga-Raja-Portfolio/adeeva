import { memo, useMemo, type CSSProperties } from "react";
import type { AvatarLook } from "../../../../../engine/avatar";
import { easeOut, window01 } from "../../../../../ui/kit/easing";
import type { HomeStoryDef } from "../../../content/homeStory";
import { VISITOR_ECHOES } from "../../../content/visitor";
import { glowPath, placedLights, runRoom, type MakeoverRun, type PlacedDecor } from "../../../core";
import { cutawayFrame, floorPoint } from "../../art/cutawayFrame";
import { RoomCutaway } from "../../art/RoomCutaway";
import { roomHex } from "../../art/roomHex";
import { PartyBunting } from "./PartyBunting";
import { StripVisitors } from "./StripVisitors";
import { BARE, FINISHED, roomLook } from "../../art/roomLook";
import { CUTAWAY_HEIGHT, CUTAWAY_WIDTH } from "../../art/cutawayFrame";

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

const StaticRoom = memo(function StaticRoom({
  run,
  label,
  evening,
  palette,
  bare,
}: {
  run: MakeoverRun;
  label: string;
  evening: boolean;
  palette: readonly string[];
  bare: boolean;
}) {
  return (
    <RoomCutaway
      look={roomLook(run, bare ? BARE : FINISHED)}
      title={bare ? `${label} before` : label}
      evening={bare ? false : evening}
      className="is-strip__cutaway"
      staging={bare ? undefined : { palette }}
    />
  );
});

function LiveLayer({
  run,
  earlier,
  t,
  still,
  visitors,
  story,
  palette,
}: {
  run: MakeoverRun;
  earlier: readonly MakeoverRun[];
  t: number;
  still: boolean;
  visitors: readonly AvatarLook[];
  story: HomeStoryDef;
  palette: readonly string[];
}) {
  const lightsOn = still ? 1 : easeOut(window01(t, 0.04, 0.3));
  return (
    <svg className="is-strip__live" viewBox={`0 0 ${CUTAWAY_WIDTH} ${CUTAWAY_HEIGHT}`} aria-hidden="true">
      {lightsOn < 1 ? (
        <rect width={CUTAWAY_WIDTH} height={CUTAWAY_HEIGHT} fill="#141026" opacity={0.55 * (1 - lightsOn)} />
      ) : null}
      <PartyBunting frame={cutawayFrame(runRoom(run))} colours={palette} shown={lightsOn} />
      <GlowSteps run={run} t={t} still={still} />
      <StripVisitors
        run={run}
        t={t}
        still={still}
        visitors={visitors}
        cloth={roomHex(story.palette[1] ?? story.palette[0] ?? "ivory")}
      />
      <StoryBubbles run={run} earlier={earlier} t={t} still={still} story={story} />
    </svg>
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
  const style = { "--strip-rooms": rooms.length, "--strip-focus": focus } as CSSProperties;
  const palette = useMemo(() => story.palette.map((colour) => roomHex(colour)), [story]);
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
                  <StaticRoom
                    run={entry.run}
                    label={entry.label}
                    evening={evening}
                    palette={palette}
                    bare={false}
                  />
                  {current && !finale ? (
                    <LiveLayer
                      run={entry.run}
                      earlier={rooms.slice(0, index).map((other) => other.run)}
                      t={t}
                      still={still}
                      visitors={visitors}
                      story={story}
                      palette={palette}
                    />
                  ) : null}
                  {finale ? (
                    <div
                      className="is-strip__before"
                      style={{ clipPath: `inset(0 0 0 ${(reveal * 100).toFixed(1)}%)` }}
                    >
                      <StaticRoom
                        run={entry.run}
                        label={entry.label}
                        evening={false}
                        palette={palette}
                        bare
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
