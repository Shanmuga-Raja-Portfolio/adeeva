import type { PointerEvent, ReactNode, Ref } from "react";
import { colourById } from "../../../../../engine/palette";
import { lighten } from "../../../../../ui/art/colourMix";
import { useSvgId } from "../../../../../ui/art/useSvgId";
import { recipeById, WINDOW_HEIGHT, WINDOW_WIDTH, type RackPiece, type WindowDisplay } from "../../../core";
import type { SeasonDef } from "../../../content/season";
import { pieceCloth } from "../../art/findCloth";
import { ProductPreview } from "../../art/ProductPreview";
import { PROP_SIZE, PropArt } from "../../art/PropArt";

export type WindowItemKey = `piece:${string}` | `prop:${string}`;

export const PIECE_BOX = 150;

export interface WindowSceneProps {
  readonly display: WindowDisplay;
  readonly rack: readonly RackPiece[];
  readonly season: SeasonDef | null;
  readonly signName: string;
  readonly title: string;
  readonly className?: string | undefined;
  readonly selected?: WindowItemKey | null | undefined;
  readonly svgRef?: Ref<SVGSVGElement> | undefined;
  readonly onItemDown?: ((event: PointerEvent<SVGGElement>, key: WindowItemKey) => void) | undefined;
  readonly children?: ReactNode;
}

export function WindowScene({
  display,
  rack,
  season,
  signName,
  title,
  className,
  selected = null,
  svgRef,
  onItemDown,
  children,
}: WindowSceneProps) {
  const id = useSvgId("window");
  const wash = season === null ? "#f3e6cf" : lighten(colourById(season.palette[2] ?? "ivory").hex, 0.72);
  const accent = season === null ? "#7b7fd1" : colourById(season.palette[0] ?? "blush").hex;
  return (
    <svg
      ref={svgRef}
      className={className ? `tf-window ${className}` : "tf-window"}
      viewBox={`0 0 ${WINDOW_WIDTH} ${WINDOW_HEIGHT}`}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={wash} />
          <stop offset="1" stopColor="#f7efe1" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.28} />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity={0.16} />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect width={WINDOW_WIDTH} height={WINDOW_HEIGHT} fill={`url(#${id}-wall)`} />
      {Array.from({ length: 12 }, (_, index) => (
        <path
          key={index}
          d={`M${index * 50 + 25} 0 V${WINDOW_HEIGHT - 70}`}
          stroke={accent}
          strokeOpacity={0.12}
          strokeWidth={14}
        />
      ))}
      <path
        d={`M0 18 Q${WINDOW_WIDTH / 2} 52 ${WINDOW_WIDTH} 18`}
        fill="none"
        stroke="#6b5235"
        strokeWidth={1.5}
      />
      {Array.from({ length: 14 }, (_, index) => {
        const x = 12 + index * 42;
        const t = x / WINDOW_WIDTH;
        const y = 18 + 4 * 34 * t * (1 - t);
        return (
          <path
            key={x}
            d={`M${x} ${y} L${x + 24} ${y + 1} L${x + 12} ${y + 18} Z`}
            fill={index % 2 === 0 ? accent : "#f6d36b"}
          />
        );
      })}
      <path d={`M0 ${WINDOW_HEIGHT - 70} H${WINDOW_WIDTH} V${WINDOW_HEIGHT} H0 Z`} fill="#c99f72" />
      <path d={`M0 ${WINDOW_HEIGHT - 70} H${WINDOW_WIDTH}`} stroke="#a07a52" strokeWidth={6} />
      {[200, 400].map((x) => (
        <path
          key={x}
          d={`M${x} 40 V${WINDOW_HEIGHT - 76}`}
          stroke="#a07a52"
          strokeOpacity={0.2}
          strokeWidth={2}
          strokeDasharray="6 8"
        />
      ))}
      {display.props.map((entry) => {
        const key: WindowItemKey = `prop:${entry.propId}`;
        return (
          <g
            key={key}
            transform={`translate(${entry.x} ${entry.y}) scale(1.2)`}
            className={selected === key ? "tf-window__item is-selected" : "tf-window__item"}
            onPointerDown={onItemDown === undefined ? undefined : (event) => onItemDown(event, key)}
            data-window-item={key}
          >
            <rect
              x={-PROP_SIZE / 2}
              y={-PROP_SIZE / 2}
              width={PROP_SIZE}
              height={PROP_SIZE}
              fill="transparent"
            />
            <PropArt propId={entry.propId} />
            {selected === key ? (
              <rect
                x={-44}
                y={-44}
                width={88}
                height={88}
                rx={10}
                fill="none"
                stroke="#f08a3c"
                strokeWidth={3}
                strokeDasharray="6 4"
              />
            ) : null}
          </g>
        );
      })}
      {display.pieces.map((entry) => {
        const piece = rack.find((candidate) => candidate.id === entry.pieceId);
        if (piece === undefined) return null;
        const key: WindowItemKey = `piece:${entry.pieceId}`;
        return (
          <g
            key={key}
            className={selected === key ? "tf-window__item is-selected" : "tf-window__item"}
            onPointerDown={onItemDown === undefined ? undefined : (event) => onItemDown(event, key)}
            data-window-item={key}
          >
            <rect
              x={entry.x - PIECE_BOX / 2}
              y={entry.y - PIECE_BOX / 2}
              width={PIECE_BOX}
              height={PIECE_BOX}
              fill="transparent"
            />
            <ellipse
              cx={entry.x}
              cy={entry.y + PIECE_BOX / 2 - 4}
              rx={52}
              ry={8}
              fill="#3b2a1c"
              opacity={0.18}
            />
            <svg
              x={entry.x - PIECE_BOX / 2}
              y={entry.y - PIECE_BOX / 2}
              width={PIECE_BOX}
              height={PIECE_BOX}
              viewBox="0 0 400 400"
            >
              <ProductPreview
                design={piece.design}
                cloth={pieceCloth(piece.id, piece.cloth)}
                finishes={piece.finishes}
                title={recipeById(piece.recipeId).name}
              />
            </svg>
            {selected === key ? (
              <rect
                x={entry.x - PIECE_BOX / 2}
                y={entry.y - PIECE_BOX / 2}
                width={PIECE_BOX}
                height={PIECE_BOX}
                rx={12}
                fill="none"
                stroke="#f08a3c"
                strokeWidth={3}
                strokeDasharray="6 4"
              />
            ) : null}
          </g>
        );
      })}
      <rect width={WINDOW_WIDTH} height={WINDOW_HEIGHT} fill={`url(#${id}-glass)`} pointerEvents="none" />
      <text
        x={WINDOW_WIDTH / 2}
        y={WINDOW_HEIGHT - 26}
        textAnchor="middle"
        fontFamily="'Rockwell', 'Roboto Slab', Georgia, serif"
        fontSize={22}
        fill="#6b5235"
        opacity={0.55}
        pointerEvents="none"
      >
        {signName}
      </text>
      {children}
    </svg>
  );
}
