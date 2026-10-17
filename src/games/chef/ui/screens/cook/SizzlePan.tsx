import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useSvgId } from "../../../../../ui/art/useSvgId";
import { clientToSvg } from "../../../../../ui/kit/clientToSvg";
import type { SizzleDef } from "../../../content/dish";
import { doneness, type PanZone } from "../../../core";
import {
  CENTRE_SHARE,
  clampToPan,
  PAN_CENTRE,
  PAN_RADIUS,
  readyFor,
  zoneAt,
  type PanSim,
  type PieceSim,
} from "./panSim";
import { Gloss, PIECE_REACH, pieceColour, pieceScale, PieceShape } from "../../art/PanPiece";
import "./cook.css";
import "./sizzle.css";

export interface SizzlePanProps {
  readonly def: SizzleDef;
  readonly sim: PanSim;
  readonly assisted: boolean;
  readonly reducedMotion: boolean;
  readonly onFlip: (index: number) => void;
  readonly onMove: (index: number, zone: PanZone, x: number, y: number) => void;
  readonly onOff: (index: number) => void;
  readonly onToss: () => void;
}

const TRAY_X = 420;

const OIL_SPOTS: readonly (readonly [number, number])[] = [
  [110, 260],
  [292, 132],
  [96, 150],
  [300, 280],
  [190, 336],
  [214, 62],
];

function traySlot(order: number, count: number): number {
  return count === 1 ? 150 : 84 + (order * 156) / (count - 1);
}

function CookRing({ cook, flipsLeft }: { readonly cook: number; readonly flipsLeft: boolean }) {
  const share = Math.min(1, cook);
  const radius = 37;
  const angle = share * Math.PI * 2 - Math.PI / 2;
  const large = share > 0.5 ? 1 : 0;
  const tone = doneness(cook);
  const colour =
    tone === "golden" ? "#f2a93b" : tone === "deep" || tone === "extra-crispy" ? "#9a5a22" : "#ffe6a8";
  return (
    <g>
      <circle r={radius} fill="none" stroke="#000000" strokeOpacity={0.35} strokeWidth={5} />
      {share > 0.001 ? (
        share >= 0.999 ? (
          <circle r={radius} fill="none" stroke={colour} strokeWidth={5} />
        ) : (
          <path
            d={`M0 ${-radius} A${radius} ${radius} 0 ${large} 1 ${Math.cos(angle) * radius} ${Math.sin(angle) * radius}`}
            fill="none"
            stroke={colour}
            strokeWidth={5}
            strokeLinecap="round"
          />
        )
      ) : null}
      {flipsLeft ? null : (
        <g transform={`translate(${radius * 0.72} ${radius * 0.72})`}>
          <circle r={9} fill="#4f8a3c" stroke="#ffffff" strokeWidth={2} />
          <path
            d="M-4 0 L-1 3 L4 -3"
            stroke="#ffffff"
            strokeWidth={2.2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </g>
  );
}

interface Drag {
  readonly index: number;
  readonly startX: number;
  readonly startY: number;
  readonly moved: boolean;
  readonly x: number;
  readonly y: number;
}

export function SizzlePan({
  def,
  sim,
  assisted,
  reducedMotion,
  onFlip,
  onMove,
  onOff,
  onToss,
}: SizzlePanProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const id = useSvgId("ck-pan");
  const [drag, setDrag] = useState<Drag | null>(null);
  const [swipe, setSwipe] = useState<{ readonly y: number } | null>(null);
  const [focus, setFocus] = useState(0);

  const toSvg = (event: PointerEvent<Element>) => clientToSvg(svgRef.current, event.clientX, event.clientY);

  const pieceDown = (event: PointerEvent<SVGGElement>, index: number) => {
    event.stopPropagation();
    const point = toSvg(event);
    if (point === null) return;
    svgRef.current?.setPointerCapture(event.pointerId);
    setFocus(index);
    setDrag({ index, startX: point.x, startY: point.y, moved: false, x: point.x, y: point.y });
  };

  const move = (event: PointerEvent<SVGSVGElement>) => {
    if (drag === null) return;
    const point = toSvg(event);
    if (point === null) return;
    const moved = drag.moved || Math.hypot(point.x - drag.startX, point.y - drag.startY) > 10;
    setDrag({ ...drag, moved, x: point.x, y: point.y });
  };

  const up = (event: PointerEvent<SVGSVGElement>) => {
    const point = toSvg(event);
    if (drag !== null) {
      const piece = sim.pieces[drag.index];
      if (piece !== undefined && !piece.off) {
        if (!drag.moved) onFlip(drag.index);
        else if (point !== null && point.x > TRAY_X - 10) onOff(drag.index);
        else if (point !== null) {
          const [x, y] = clampToPan(point.x, point.y);
          onMove(drag.index, zoneAt(x, y), x, y);
        }
      }
      setDrag(null);
      return;
    }
    if (swipe !== null && point !== null && swipe.y - point.y > 80) onToss();
    setSwipe(null);
  };

  const keyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    const count = sim.pieces.length;
    const piece = sim.pieces[focus];
    if (event.key === "ArrowRight" || event.key === "ArrowDown") setFocus((focus + 1) % count);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") setFocus((focus - 1 + count) % count);
    else if (event.key === "f" || event.key === "F") onFlip(focus);
    else if (event.key === "d" || event.key === "D") onOff(focus);
    else if ((event.key === "m" || event.key === "M") && piece !== undefined) {
      const zone: PanZone = piece.zone === "centre" ? "rim" : "centre";
      const angle = Math.atan2(piece.y - PAN_CENTRE, piece.x - PAN_CENTRE) || -Math.PI / 2;
      const distance = zone === "centre" ? 40 : PAN_RADIUS - 40;
      onMove(focus, zone, PAN_CENTRE + Math.cos(angle) * distance, PAN_CENTRE + Math.sin(angle) * distance);
    } else return;
    event.preventDefault();
  };

  const offCount = sim.pieces.filter((piece) => piece.off).length;
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 560 400"
      className="ck-pan"
      role="application"
      tabIndex={0}
      aria-label="The pan. Tap a piece to flip it, drag it to the rim to slow it down, or onto Done to take it off. Keys: arrows pick, F flips, D takes off, M moves."
      onPointerDown={(event) => {
        const point = toSvg(event);
        if (point !== null) setSwipe({ y: point.y });
      }}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={() => {
        setDrag(null);
        setSwipe(null);
      }}
      onKeyDown={keyDown}
      data-testid="sizzle-pan"
      data-tick={sim.tick}
      data-cooks={JSON.stringify(
        sim.pieces.map((piece) => Math.round((piece.sides[piece.side] ?? 0) * 100) / 100),
      )}
    >
      <defs>
        <radialGradient id={`${id}-metal`} cx="0.42" cy="0.38" r="0.72">
          <stop offset="0" stopColor="#8d9498" />
          <stop offset="0.45" stopColor="#5f676b" />
          <stop offset="0.85" stopColor="#3d4448" />
          <stop offset="1" stopColor="#24292c" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f7f8" />
          <stop offset="0.3" stopColor="#b9c4c9" />
          <stop offset="0.7" stopColor="#7d8a91" />
          <stop offset="1" stopColor="#3a4448" />
        </linearGradient>
        <radialGradient id={`${id}-oil`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.55" stopColor="#ffd58a" stopOpacity={0} />
          <stop offset="0.8" stopColor="#ffd58a" stopOpacity={0.26} />
          <stop offset="1" stopColor="#ffd58a" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-heat`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffb347" stopOpacity={0.2 + sim.heat * 0.09} />
          <stop offset="0.7" stopColor="#ff7a2a" stopOpacity={0.08 + sim.heat * 0.04} />
          <stop offset="1" stopColor="#d9472b" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.6" stopColor="#ff8a2a" stopOpacity={0.12 + sim.heat * 0.07} />
          <stop offset="1" stopColor="#ff8a2a" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-board`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2b77a" />
          <stop offset="1" stopColor="#b98444" />
        </linearGradient>
      </defs>
      <circle cx={PAN_CENTRE} cy={PAN_CENTRE + 8} r={PAN_RADIUS + 30} fill={`url(#${id}-glow)`} />
      <path
        d={`M${PAN_CENTRE + PAN_RADIUS - 6} ${PAN_CENTRE - 40} L${PAN_CENTRE + PAN_RADIUS + 40} ${PAN_CENTRE - 112}`}
        stroke="#3a4448"
        strokeWidth={20}
        strokeLinecap="round"
      />
      <path
        d={`M${PAN_CENTRE + PAN_RADIUS + 34} ${PAN_CENTRE - 102} L${PAN_CENTRE + PAN_RADIUS + 70} ${PAN_CENTRE - 158}`}
        stroke="#1f2427"
        strokeWidth={26}
        strokeLinecap="round"
      />
      <path
        d={`M${PAN_CENTRE + PAN_RADIUS + 40} ${PAN_CENTRE - 112} L${PAN_CENTRE + PAN_RADIUS + 64} ${PAN_CENTRE - 150}`}
        stroke="#5f6c73"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.6}
      />
      <circle cx={PAN_CENTRE + PAN_RADIUS + 6} cy={PAN_CENTRE - 48} r={4} fill="#aeb9bf" />
      <circle cx={PAN_CENTRE + 6} cy={PAN_CENTRE + 12} r={PAN_RADIUS + 12} fill="#0d1215" opacity={0.4} />
      <circle cx={PAN_CENTRE} cy={PAN_CENTRE} r={PAN_RADIUS + 12} fill={`url(#${id}-rim)`} />
      <circle cx={PAN_CENTRE} cy={PAN_CENTRE} r={PAN_RADIUS + 2} fill="#20282c" />
      <circle cx={PAN_CENTRE} cy={PAN_CENTRE} r={PAN_RADIUS - 4} fill={`url(#${id}-metal)`} />
      <circle cx={PAN_CENTRE} cy={PAN_CENTRE} r={PAN_RADIUS - 4} fill={`url(#${id}-oil)`} />
      {[0.28, 0.42, 0.62, 0.78, 0.9].map((share) => (
        <circle
          key={share}
          cx={PAN_CENTRE}
          cy={PAN_CENTRE}
          r={PAN_RADIUS * share}
          fill="none"
          stroke="#ffffff"
          strokeWidth={1}
          opacity={0.05}
        />
      ))}
      <path
        d={`M${PAN_CENTRE - PAN_RADIUS + 6} ${PAN_CENTRE - 20} A${PAN_RADIUS + 6} ${PAN_RADIUS + 6} 0 0 1 ${PAN_CENTRE + 30} ${PAN_CENTRE - PAN_RADIUS - 5}`}
        stroke="#ffffff"
        strokeWidth={3}
        opacity={0.35}
        fill="none"
        strokeLinecap="round"
      />
      <circle
        cx={PAN_CENTRE}
        cy={PAN_CENTRE}
        r={PAN_RADIUS * CENTRE_SHARE}
        fill={`url(#${id}-heat)`}
        className={reducedMotion ? undefined : "ck-pan__shimmer"}
      />
      <ellipse
        cx={PAN_CENTRE - 50}
        cy={PAN_CENTRE - 70}
        rx={70}
        ry={22}
        fill="#ffe6a8"
        opacity={0.08}
        transform={`rotate(-28 ${PAN_CENTRE - 50} ${PAN_CENTRE - 70})`}
      />
      <circle
        cx={PAN_CENTRE}
        cy={PAN_CENTRE}
        r={PAN_RADIUS * CENTRE_SHARE}
        fill="none"
        stroke="#f2a93b"
        strokeOpacity={0.45}
        strokeWidth={2}
        strokeDasharray="6 8"
      />
      {OIL_SPOTS.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={3} fill="#ffe6a8" opacity={0.28} />
      ))}
      {reducedMotion
        ? null
        : [0, 1, 2, 3, 4, 5].map((index) => (
            <circle
              key={index}
              cx={PAN_CENTRE - 90 + index * 36}
              cy={PAN_CENTRE + ((index * 37) % 60) - 30}
              r={3}
              fill="#f6dd7a"
              className="ck-pan__pop"
              style={{ animationDelay: `${index * 0.35}s` }}
            />
          ))}
      <g transform={`translate(${TRAY_X + 6} 70)`}>
        <rect x={4} y={8} width={124} height={262} rx={18} fill="#0d1215" opacity={0.3} />
        <rect width={124} height={258} rx={18} fill={`url(#${id}-board)`} stroke="#8a5a2a" strokeWidth={3} />
        <rect x={12} y={52} width={100} height={194} rx={6} fill="#fbf3dd" transform="rotate(-2 62 149)" />
        <path
          d="M20 90 l20 6 M70 130 l22 -4 M28 200 l18 8 M74 220 l16 -6"
          stroke="#e2d4b0"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <rect x={10} y={10} width={104} height={34} rx={17} fill="#2e3a40" />
        <text x={62} y={34} textAnchor="middle" className="ck-pan__tray-label">
          Done {offCount}/{sim.pieces.length}
        </text>
        {sim.pieces.map((_, index) =>
          index < offCount ? null : (
            <g key={`slot-${index}`}>
              <ellipse
                cx={62}
                cy={traySlot(index, sim.pieces.length)}
                rx={24}
                ry={17}
                fill="#efe2c2"
                stroke="#a8865a"
                strokeWidth={2.5}
                strokeDasharray="6 4"
              />
              <text
                x={62}
                y={traySlot(index, sim.pieces.length) + 6}
                textAnchor="middle"
                className="ck-pan__slot-label"
              >
                {index + 1}
              </text>
            </g>
          ),
        )}
        {sim.pieces.map((piece, index) => {
          if (!piece.off) return null;
          const order = sim.pieces.slice(0, index).filter((entry) => entry.off).length;
          return (
            <g key={index} transform={`translate(62 ${traySlot(order, sim.pieces.length)}) scale(0.78)`}>
              <PieceShape kind={def.piece} fill={pieceColour(def.piece, piece.sides[piece.side] ?? 0)} />
              <Gloss />
            </g>
          );
        })}
      </g>
      {sim.pieces.map((piece: PieceSim, index) => {
        if (piece.off) return null;
        const dragging = drag?.index === index && drag.moved;
        const x = dragging ? drag.x : piece.x;
        const y = dragging ? drag.y : piece.y;
        const cook = piece.sides[piece.side] ?? 0;
        const top = piece.side === 0 ? 0 : (piece.sides[piece.side - 1] ?? 0);
        const ready = assisted ? readyFor(piece, def) : null;
        return (
          <g
            key={index}
            transform={`translate(${x} ${y})`}
            className={focus === index ? "ck-piece ck-piece--focus" : "ck-piece"}
            onPointerDown={(event) => pieceDown(event, index)}
            data-testid={`piece-${index}`}
            data-cook={cook.toFixed(2)}
            data-side={piece.side}
          >
            <circle r={40} fill="transparent" />
            <CookRing cook={cook} flipsLeft={piece.side < def.flips} />
            <g transform={`scale(${pieceScale(def.piece)})`}>
              <ellipse
                cx={2}
                cy={5}
                rx={PIECE_REACH[def.piece]}
                ry={PIECE_REACH[def.piece] * 0.8}
                fill="#0d0805"
                opacity={0.35}
              />
              <PieceShape kind={def.piece} fill={pieceColour(def.piece, top)} />
              <Gloss />
            </g>
            {reducedMotion ? null : (
              <path
                d="M-10 -38 c-6 -6 6 -10 0 -16 c-5 -6 5 -9 0 -14 M10 -40 c-6 -6 6 -10 0 -16 c-5 -6 5 -9 0 -14"
                stroke="#ffffff"
                strokeWidth={4}
                strokeLinecap="round"
                opacity={0.45}
                fill="none"
                className="ck-piece__steam"
              />
            )}
            {ready !== null ? (
              <g transform="translate(0 -62)" className={reducedMotion ? undefined : "ck-bob"}>
                <circle r={24} fill="#f2a93b" />
                <path
                  d={
                    ready === "flip"
                      ? "M-10 4 A10 10 0 1 1 10 4 M6 -2 L10 4 L16 -1"
                      : "M-10 0 H10 M4 -6 L10 0 L4 6"
                  }
                  stroke="#2e3a40"
                  strokeWidth={3.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
