import type { AvatarLook } from "../../../../engine/avatar";
import { AvatarFigure } from "../../../../ui/art/avatar/Avatar";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { DishId } from "../../content/dish";
import { dishById, ghostLayout } from "../../core";
import { chefWhites } from "./chefWhites";
import { PlateGroup } from "./PlateArt";

export interface KitchenPassProps {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly chef: AvatarLook;
  readonly dishes: readonly DishId[];
  readonly bright: boolean;
}

const CHEF_SCALE = 0.34;

export function KitchenPass({ x, y, width, height, chef, dishes, bright }: KitchenPassProps) {
  const id = useSvgId("ck-pass");
  const counter = y + height;
  const lamps = [x + width * 0.3, x + width * 0.72];
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#ffe0a0" />
          <stop offset="0.55" stopColor="#f2a24a" />
          <stop offset="1" stopColor="#8a4a1e" />
        </radialGradient>
        <linearGradient id={`${id}-cone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb85a" stopOpacity={bright ? 0.55 : 0.3} />
          <stop offset="1" stopColor="#ff9a3a" stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1f4f5" />
          <stop offset="0.4" stopColor="#b9c4c9" />
          <stop offset="1" stopColor="#6a767c" />
        </linearGradient>
        <clipPath id={`${id}-hatch`}>
          <rect x={x} y={y} width={width} height={height + 4} rx={10} />
        </clipPath>
      </defs>
      <rect x={x - 18} y={y - 18} width={width + 36} height={height + 30} rx={16} fill="#3a1d10" />
      <rect x={x - 10} y={y - 10} width={width + 20} height={height + 20} rx={12} fill="#5a2f1c" />
      <g clipPath={`url(#${id}-hatch)`}>
        <rect x={x} y={y} width={width} height={height + 4} fill={`url(#${id}-glow)`} />
        {Array.from({ length: Math.ceil(width / 34) + 1 }, (_, column) =>
          Array.from({ length: 4 }, (__, row) => (
            <rect
              key={`${column}-${row}`}
              x={x + column * 34 + (row % 2) * 17 - 17}
              y={y + 70 + row * 22}
              width={32}
              height={20}
              rx={2}
              fill="#fff3dc"
              opacity={0.16}
            />
          )),
        )}
        <rect x={x} y={y + 52} width={width} height={6} fill="#6a4a30" opacity={0.6} />
        {[0, 1, 2, 3].map((index) => (
          <g key={index} transform={`translate(${x + 24 + index * ((width - 48) / 3)} ${y + 52})`}>
            <path d="M-14 0 v-18 h28 v18 Z" fill={index % 2 === 0 ? "#5f6c73" : "#c4502e"} />
            <rect x={-16} y={-21} width={32} height={5} rx={2} fill="#2e3a40" opacity={0.6} />
          </g>
        ))}
        <path d={`M${x} ${y + 8} H${x + width}`} stroke="#2e3a40" strokeWidth={4} />
        {[0, 1, 2].map((index) => (
          <g
            key={index}
            transform={`translate(${x + 26 + index * 40} ${y + 10}) rotate(${index % 2 === 0 ? -4 : 3})`}
          >
            <rect width={30} height={40} rx={2} fill="#fffaf0" />
            <path d="M5 12 h20 M5 20 h14 M5 28 h18" stroke="#2e3a40" strokeWidth={2} opacity={0.5} />
          </g>
        ))}
        {lamps.map((lx) => (
          <g key={lx}>
            <path
              d={`M${lx - 46} ${y + 34} L${lx - 90} ${counter} H${lx + 90} L${lx + 46} ${y + 34} Z`}
              fill={`url(#${id}-cone)`}
            />
            <path d={`M${lx} ${y} V${y + 18}`} stroke="#2e3a40" strokeWidth={3} />
            <path d={`M${lx - 34} ${y + 36} Q${lx} ${y + 6} ${lx + 34} ${y + 36} Z`} fill="#d9472b" />
            <ellipse cx={lx} cy={y + 36} rx={28} ry={6} fill="#ffe6a8" />
          </g>
        ))}
        <g className="ck-pass-chef">
          <g transform={`translate(${x + width / 2 - 200 * CHEF_SCALE} ${y + 22}) scale(${CHEF_SCALE})`}>
            <AvatarFigure look={chef} garment={chefWhites("#d9472b")} mood="delighted" pose="wave" />
          </g>
        </g>
      </g>
      <rect x={x - 22} y={counter - 4} width={width + 44} height={26} rx={6} fill={`url(#${id}-steel)`} />
      <rect x={x - 22} y={counter - 4} width={width + 44} height={4} rx={2} fill="#ffffff" opacity={0.7} />
      {dishes.slice(0, 2).map((dishId, index) => (
        <g key={dishId}>
          <ellipse cx={lamps[index] ?? x} cy={counter + 4} rx={46} ry={8} fill="#1d1208" opacity={0.25} />
          <PlateGroup
            colour="white"
            components={ghostLayout(dishById(dishId))}
            transform={`translate(${(lamps[index] ?? x) - 40} ${counter - 26}) scale(0.2 0.13)`}
          />
        </g>
      ))}
    </g>
  );
}
