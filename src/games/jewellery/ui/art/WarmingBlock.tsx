import { useSvgId } from "../../../../ui/art/useSvgId";

interface WarmingBlockProps {
  readonly x: number;
  readonly width: number;
  readonly warmth: number;
  readonly over: boolean;
}

const TOP = 184;
const FACE = 198;
const BOTTOM = 246;

export function WarmingBlock({ x, width, warmth, over }: WarmingBlockProps) {
  const id = useSvgId("jb-block");
  const right = x + width;
  const glow = over ? "#ff7a3d" : "#ffb35a";
  const holes = Array.from({ length: 9 }, (_, column) =>
    Array.from({ length: 3 }, (_, row) => ({
      cx: x + 22 + column * ((width - 44) / 8) + (row % 2) * 9,
      cy: FACE + 12 + row * 13,
      key: `${column}-${row}`,
    })),
  ).flat();
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4d4248" />
          <stop offset="1" stopColor="#231b20" />
        </linearGradient>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6e6168" />
          <stop offset="1" stopColor="#544850" />
        </linearGradient>
        <radialGradient id={`${id}-heat`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={glow} stopOpacity={0.15 + warmth * 0.75} />
          <stop offset="1" stopColor={glow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x + width / 2} cy={BOTTOM + 4} rx={width * 0.56} ry={9} fill="#120a0e" opacity={0.55} />
      <path
        d={`M${x + 10} ${TOP} L${right - 10} ${TOP} L${right} ${FACE} L${x} ${FACE} Z`}
        fill={`url(#${id}-top)`}
      />
      <rect x={x} y={FACE} width={width} height={BOTTOM - FACE} rx={5} fill={`url(#${id}-face)`} />
      <g fill="#140d11" opacity={0.75}>
        {holes.map((hole) => (
          <ellipse key={hole.key} cx={hole.cx} cy={hole.cy} rx={3.2} ry={2.4} />
        ))}
      </g>
      <g fill="#3a3036">
        {Array.from({ length: 12 }, (_, index) => (
          <ellipse key={index} cx={x + 20 + index * ((width - 40) / 11)} cy={TOP + 7} rx={3} ry={1.4} />
        ))}
      </g>
      <path d={`M${x + 10} ${TOP} L${right - 10} ${TOP}`} stroke="#8d8088" strokeWidth={1.5} />
      <path d={`M${x} ${FACE} L${right} ${FACE}`} stroke="#7a6d75" strokeWidth={1.2} />
      <ellipse cx={x + width / 2} cy={TOP + 6} rx={width * 0.36} ry={16} fill={`url(#${id}-heat)`} />
    </g>
  );
}
