import { useSvgId } from "../../../../ui/art/useSvgId";
import { darken, lighten } from "../../../../ui/art/colourMix";
import type { CuisineDef, CuisineId } from "../../content/cuisine";
import { ghostLayout, lessonDish } from "../../core";
import { PlateGroup } from "./PlateArt";

export interface CorridorIds {
  readonly leafShade: string;
  readonly sign: string;
  readonly spill: string;
  readonly soft: string;
  readonly inside: string;
  readonly halo: string;
}

type DoorShape = "round" | "pointed" | "flat";

const SHAPES: Readonly<Record<CuisineId, DoorShape>> = {
  italian: "round",
  indian: "pointed",
  japanese: "flat",
  mexican: "flat",
  french: "round",
  "west-african": "flat",
};

const TOP = 196;
const BOTTOM = 448;
const HALF = 58;
const FRAME = 14;

function outline(shape: DoorShape, cx: number, half: number, top: number): string {
  const left = cx - half;
  const right = cx + half;
  if (shape === "round")
    return `M${left} ${BOTTOM} V${top + half} A${half} ${half} 0 0 1 ${right} ${top + half} V${BOTTOM} Z`;
  if (shape === "pointed")
    return `M${left} ${BOTTOM} V${top + 58} C${left} ${top + 24} ${cx - 10} ${top + 18} ${cx} ${top} C${cx + 10} ${top + 18} ${right} ${top + 24} ${right} ${top + 58} V${BOTTOM} Z`;
  return `M${left} ${BOTTOM} V${top + 22} H${right} V${BOTTOM} Z`;
}

function Kente({ x, colours }: { readonly x: number; readonly colours: readonly string[] }) {
  return (
    <g>
      {Array.from({ length: 14 }, (_, row) => (
        <rect
          key={row}
          x={x}
          y={220 + row * 16}
          width={12}
          height={16}
          fill={colours[row % colours.length]}
        />
      ))}
    </g>
  );
}

function LeafPattern({ cuisine, cx }: { readonly cuisine: CuisineDef; readonly cx: number }) {
  const left = cx - HALF;
  const right = cx + HALF;
  const panel = darken(cuisine.wall, 0.18);
  const bevel = lighten(cuisine.wall, 0.35);
  if (cuisine.id === "japanese")
    return (
      <g>
        <rect x={left} y={TOP} width={HALF * 2} height={BOTTOM - TOP} fill="#f7efdc" />
        {[1, 2, 3].map((column) => (
          <path
            key={column}
            d={`M${left + column * 29} ${TOP} V${BOTTOM}`}
            stroke="#8a6a44"
            strokeWidth={4}
          />
        ))}
        {[1, 2, 3, 4, 5, 6, 7].map((row) => (
          <path key={row} d={`M${left} ${TOP + row * 32} H${right}`} stroke="#8a6a44" strokeWidth={4} />
        ))}
        <path
          d={`M${left} ${TOP + 22} H${right} V${TOP + 92} H${cx + 3} V${TOP + 40} H${cx - 3} V${TOP + 92} H${left} Z`}
          fill={cuisine.accent}
        />
        <circle cx={cx - 30} cy={TOP + 66} r={10} fill="none" stroke="#f7efdc" strokeWidth={3} />
      </g>
    );
  if (cuisine.id === "french")
    return (
      <g>
        <path d={`M${cx} ${TOP + 60} V${BOTTOM}`} stroke={darken(cuisine.wall, 0.4)} strokeWidth={3} />
        {[0, 1].map((leaf) =>
          [0, 1, 2].map((row) => (
            <rect
              key={`${leaf}-${row}`}
              x={left + 10 + leaf * HALF}
              y={318 + row * 36}
              width={HALF - 20}
              height={28}
              rx={3}
              fill="#d9ecf2"
              stroke={darken(cuisine.wall, 0.3)}
              strokeWidth={3}
            />
          )),
        )}
        <circle cx={cx - 8} cy={378} r={5} fill="#f2c46b" stroke="#a3651f" strokeWidth={2} />
        <circle cx={cx + 8} cy={378} r={5} fill="#f2c46b" stroke="#a3651f" strokeWidth={2} />
      </g>
    );
  if (cuisine.id === "west-african")
    return (
      <g>
        <Kente x={left + 6} colours={["#4f8a3c", "#f2c43b", "#c4372b", "#1f262a"]} />
        <Kente x={right - 18} colours={["#f2c43b", "#c4372b", "#1f262a", "#4f8a3c"]} />
        <path d={`M${cx} 330 l26 34 l-26 34 l-26 -34 Z`} fill={panel} stroke={bevel} strokeWidth={3} />
        <path d={`M${cx} 348 l12 16 l-12 16 l-12 -16 Z`} fill="#f2c43b" />
      </g>
    );
  if (cuisine.id === "mexican")
    return (
      <g>
        {Array.from({ length: 9 }, (_, row) =>
          [left + 4, right - 18].map((x) => (
            <g key={`${row}-${x}`} transform={`translate(${x} ${226 + row * 24})`}>
              <rect width={14} height={20} rx={2} fill="#ffffff" stroke={cuisine.accent} strokeWidth={2} />
              <path d="M7 3 l4 7 l-4 7 l-4 -7 Z" fill={cuisine.accent} />
            </g>
          )),
        )}
        <g transform={`translate(${cx} 372)`} fill={cuisine.accent}>
          {[0, 72, 144, 216, 288].map((turn) => (
            <ellipse key={turn} cx={0} cy={-13} rx={7} ry={12} transform={`rotate(${turn})`} />
          ))}
          <circle r={7} fill="#f2c43b" />
        </g>
      </g>
    );
  return (
    <g>
      {cuisine.id === "indian"
        ? Array.from({ length: 5 }, (_, row) =>
            [0, 1, 2].map((column) => (
              <circle
                key={`${row}-${column}`}
                cx={cx - 30 + column * 30}
                cy={330 + row * 22}
                r={4}
                fill="#f2c46b"
                stroke="#8a5a14"
                strokeWidth={1.5}
              />
            )),
          )
        : [0, 1].map((side) => (
            <rect
              key={side}
              x={left + 12 + side * (HALF - 2)}
              y={322}
              width={HALF - 22}
              height={100}
              rx={4}
              fill={panel}
              stroke={bevel}
              strokeWidth={2}
            />
          ))}
      {cuisine.id === "indian" ? (
        <path
          d={outline("pointed", cx, HALF - 8, TOP + 8)}
          fill="none"
          stroke={cuisine.accent}
          strokeWidth={4}
        />
      ) : null}
    </g>
  );
}

export interface MentorDoorProps {
  readonly cuisine: CuisineDef;
  readonly cx: number;
  readonly today: boolean;
  readonly ids: CorridorIds;
}

export function MentorDoor({ cuisine, cx, today, ids }: MentorDoorProps) {
  const clip = useSvgId("ck-door-clip");
  const shape = SHAPES[cuisine.id];
  const opening = outline(shape, cx, HALF, TOP);
  const left = cx - HALF;
  const leafEdge = darken(cuisine.wall, 0.3);
  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <path d={opening} />
        </clipPath>
      </defs>
      {today ? (
        <>
          <ellipse cx={cx} cy={320} rx={120} ry={180} fill={`url(#${ids.halo})`} />
          <path
            d={`M${left} ${BOTTOM} H${cx + HALF} L${cx + HALF + 90} 600 H${left - 90} Z`}
            fill={`url(#${ids.spill})`}
            filter={`url(#${ids.soft})`}
          />
        </>
      ) : null}
      <ellipse cx={cx} cy={BOTTOM + 4} rx={84} ry={9} fill="#2a1a10" opacity={0.28} />
      <path d={outline(shape, cx, HALF + FRAME, TOP - FRAME)} fill={cuisine.wallDeep} />
      <path
        d={outline(shape, cx, HALF + FRAME - 3, TOP - FRAME + 3)}
        fill="none"
        stroke={lighten(cuisine.wallDeep, 0.35)}
        strokeWidth={2}
      />
      <path
        d={`M${cx + HALF + FRAME} ${TOP + 40} V${BOTTOM}`}
        stroke="#1c1220"
        strokeWidth={6}
        opacity={0.18}
      />
      <g clipPath={`url(#${clip})`}>
        {today ? (
          <>
            <rect
              x={left}
              y={TOP - 10}
              width={HALF * 2}
              height={BOTTOM - TOP + 10}
              fill={`url(#${ids.inside})`}
            />
            <rect x={left} y={392} width={HALF * 2} height={56} fill="#c9a77a" opacity={0.7} />
            <PlateGroup
              colour="white"
              components={ghostLayout(lessonDish(cuisine.id))}
              transform={`translate(${cx - 46} 300) scale(0.23)`}
            />
            <path
              d={`M${left} ${TOP} L${left + 30} ${TOP + 16} L${left + 30} ${BOTTOM - 4} L${left} ${BOTTOM} Z`}
              fill={cuisine.wall}
            />
            <path d={`M${left + 30} ${TOP + 16} V${BOTTOM - 4}`} stroke={leafEdge} strokeWidth={4} />
          </>
        ) : (
          <>
            <rect x={left} y={TOP - 10} width={HALF * 2} height={BOTTOM - TOP + 10} fill={cuisine.wall} />
            <LeafPattern cuisine={cuisine} cx={cx} />
            <circle cx={cx + 2} cy={276} r={49} fill="#1c1220" opacity={0.3} />
            <circle cx={cx} cy={272} r={49} fill="#d8a94a" />
            <circle cx={cx} cy={272} r={49} fill="none" stroke="#9a6a1f" strokeWidth={2.5} />
            <circle cx={cx} cy={272} r={43} fill={darken(cuisine.wallDeep, 0.25)} />
            <PlateGroup
              colour="white"
              components={ghostLayout(lessonDish(cuisine.id))}
              transform={`translate(${cx - 38} 234) scale(0.19)`}
            />
            <path
              d={`M${cx - 34} 252 A44 44 0 0 1 ${cx + 4} 230`}
              stroke="#ffffff"
              strokeWidth={4}
              strokeLinecap="round"
              fill="none"
              opacity={0.55}
            />
            {cuisine.id === "french" ? null : (
              <circle cx={cx + 40} cy={350} r={7} fill="#f2c46b" stroke="#a3651f" strokeWidth={2.5} />
            )}
            {cuisine.id === "japanese" ? null : (
              <rect
                x={left + 6}
                y={BOTTOM - 22}
                width={HALF * 2 - 12}
                height={16}
                rx={3}
                fill="#d8a94a"
                stroke="#9a6a1f"
                strokeWidth={2}
              />
            )}
            <rect
              x={left}
              y={TOP - 10}
              width={HALF * 2}
              height={BOTTOM - TOP + 10}
              fill={`url(#${ids.leafShade})`}
            />
          </>
        )}
      </g>
      <g>
        <path d={`M${cx - 48} 92 V126 M${cx + 48} 92 V126`} stroke="#6f5034" strokeWidth={3} />
        <rect
          x={cx - 79}
          y={124}
          width={158}
          height={48}
          rx={9}
          fill="#2a1a10"
          opacity={0.25}
          transform="translate(3 4)"
        />
        <rect
          x={cx - 79}
          y={124}
          width={158}
          height={48}
          rx={9}
          fill={`url(#${ids.sign})`}
          stroke={cuisine.wallDeep}
          strokeWidth={3}
        />
        <rect x={cx - 73} y={129} width={146} height={5} rx={2.5} fill={cuisine.accent} opacity={0.85} />
        <text
          x={cx}
          y={157}
          textAnchor="middle"
          fontSize={27}
          fontWeight={700}
          fill="#2e3a40"
          className="ck-scene-label"
        >
          {cuisine.counter}
        </text>
        {today ? (
          <g transform={`translate(${cx + 46} 112) rotate(8)`}>
            <rect x={-34} y={-14} width={68} height={28} rx={6} fill="#d9472b" />
            <text
              y={7}
              textAnchor="middle"
              fontSize={18}
              fontWeight={700}
              fill="#ffffff"
              className="ck-scene-label"
            >
              Today
            </text>
          </g>
        ) : null}
      </g>
    </g>
  );
}
