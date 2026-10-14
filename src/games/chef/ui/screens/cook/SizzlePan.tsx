import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { darken, lighten, mixHex } from "../../../../../ui/art/colourMix";
import { useSvgId } from "../../../../../ui/art/useSvgId";
import { clientToSvg } from "../../../../../ui/kit/clientToSvg";
import type { PieceKind, SizzleDef } from "../../../content/dish";
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
import "./cook.css";

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

const RAW: Readonly<Record<PieceKind, string>> = {
  chicken: "#f0c4a4",
  plantain: "#f6dc7a",
  gnocchi: "#f3e3bd",
  egg: "#fbe9a0",
  bread: "#f2deb4",
  seeds: "#c9a77a",
  corn: "#f6dc6a",
  onion: "#f3e3c4",
  tortilla: "#f3dca0",
};

const GOLDEN = "#d99a3a";
const DEEP = "#9a5a22";
const TRAY_X = 420;

export function pieceColour(kind: PieceKind, cook: number): string {
  if (cook < 0.9) return mixHex(RAW[kind], GOLDEN, Math.max(0, cook / 0.9) * 0.55);
  if (cook <= 1.1) return mixHex(RAW[kind], GOLDEN, 0.75);
  return mixHex(GOLDEN, DEEP, Math.min(1, (cook - 1.1) / 0.5));
}

function PieceShape({ kind, fill }: { readonly kind: PieceKind; readonly fill: string }) {
  const edge = darken(fill, 0.3);
  switch (kind) {
    case "seeds":
      return (
        <g>
          {[-10, 0, 10, -5, 5].map((x, index) => (
            <ellipse
              key={index}
              cx={x}
              cy={index > 2 ? 8 : -4}
              rx={5}
              ry={3}
              fill={fill}
              stroke={edge}
              strokeWidth={1.5}
            />
          ))}
        </g>
      );
    case "corn":
      return (
        <rect x={-30} y={-14} width={60} height={28} rx={14} fill={fill} stroke={edge} strokeWidth={2.5} />
      );
    case "bread":
      return (
        <rect x={-24} y={-22} width={48} height={44} rx={10} fill={fill} stroke={edge} strokeWidth={2.5} />
      );
    case "onion":
      return (
        <g>
          <circle r={20} fill="none" stroke={fill} strokeWidth={7} />
          <circle r={11} fill="none" stroke={lighten(fill, 0.1)} strokeWidth={5} />
        </g>
      );
    case "egg":
    case "tortilla":
      return <circle r={30} fill={fill} stroke={edge} strokeWidth={2.5} />;
    case "chicken":
      return (
        <path
          d="M-22 -10 C-18 -24 12 -24 22 -12 C28 0 20 20 2 20 C-16 22 -28 6 -22 -10 Z"
          fill={fill}
          stroke={edge}
          strokeWidth={2.5}
        />
      );
    case "gnocchi":
      return (
        <g>
          <ellipse rx={20} ry={13} fill={fill} stroke={edge} strokeWidth={2} />
          <path
            d="M-10 -9 V9 M-3 -12 V12 M4 -12 V12 M11 -9 V9"
            stroke={edge}
            strokeWidth={1.5}
            opacity={0.6}
          />
        </g>
      );
    case "plantain":
      return <ellipse rx={20} ry={15} fill={fill} stroke={edge} strokeWidth={2.5} />;
  }
}

function CookRing({ cook, flipsLeft }: { readonly cook: number; readonly flipsLeft: boolean }) {
  const share = Math.min(1, cook);
  const radius = 36;
  const angle = share * Math.PI * 2 - Math.PI / 2;
  const large = share > 0.5 ? 1 : 0;
  const tone = doneness(cook);
  const colour =
    tone === "golden" ? "#f2a93b" : tone === "deep" || tone === "extra-crispy" ? "#9a5a22" : "#ffe6a8";
  return (
    <g>
      <circle r={radius} fill="none" stroke="#000000" strokeOpacity={0.25} strokeWidth={6} />
      {share > 0.001 ? (
        share >= 0.999 ? (
          <circle r={radius} fill="none" stroke={colour} strokeWidth={6} />
        ) : (
          <path
            d={`M0 ${-radius} A${radius} ${radius} 0 ${large} 1 ${Math.cos(angle) * radius} ${Math.sin(angle) * radius}`}
            fill="none"
            stroke={colour}
            strokeWidth={6}
            strokeLinecap="round"
          />
        )
      ) : null}
      {flipsLeft ? null : (
        <circle r={radius + 6} fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeDasharray="2 5" />
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
        <radialGradient id={`${id}-metal`} cx="0.45" cy="0.4" r="0.65">
          <stop offset="0" stopColor="#56636a" />
          <stop offset="1" stopColor="#1f272b" />
        </radialGradient>
        <radialGradient id={`${id}-heat`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff9a3a" stopOpacity={0.15 + sim.heat * 0.08} />
          <stop offset="1" stopColor="#d9472b" stopOpacity={0} />
        </radialGradient>
      </defs>
      <path
        d={`M${PAN_CENTRE + PAN_RADIUS - 6} ${PAN_CENTRE - 40} L${PAN_CENTRE + PAN_RADIUS + 60} ${PAN_CENTRE - 150}`}
        stroke="#2e3a40"
        strokeWidth={22}
        strokeLinecap="round"
      />
      <circle cx={PAN_CENTRE + 6} cy={PAN_CENTRE + 10} r={PAN_RADIUS + 12} fill="#0d1215" opacity={0.35} />
      <circle cx={PAN_CENTRE} cy={PAN_CENTRE} r={PAN_RADIUS + 10} fill="#3a4448" />
      <circle cx={PAN_CENTRE} cy={PAN_CENTRE} r={PAN_RADIUS} fill={`url(#${id}-metal)`} />
      <circle
        cx={PAN_CENTRE}
        cy={PAN_CENTRE}
        r={PAN_RADIUS * CENTRE_SHARE}
        fill={`url(#${id}-heat)`}
        className={reducedMotion ? undefined : "ck-pan__shimmer"}
      />
      <circle
        cx={PAN_CENTRE}
        cy={PAN_CENTRE}
        r={PAN_RADIUS * CENTRE_SHARE}
        fill="none"
        stroke="#f2a93b"
        strokeOpacity={0.35}
        strokeDasharray="6 8"
      />
      <text x={PAN_CENTRE} y={PAN_CENTRE + PAN_RADIUS - 18} textAnchor="middle" className="ck-pan__label">
        rim: slower
      </text>
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
      <g transform={`translate(${TRAY_X + 10} 90)`}>
        <rect width={120} height={220} rx={16} fill="#dfe5e8" stroke="#7d8a91" strokeWidth={3} />
        <text x={60} y={30} textAnchor="middle" className="ck-pan__tray-label">
          Done
        </text>
        {sim.pieces.map((piece, index) =>
          piece.off ? (
            <g
              key={index}
              transform={`translate(60 ${70 + (sim.pieces.slice(0, index).filter((entry) => entry.off).length % 4) * 38}) scale(0.7)`}
            >
              <PieceShape kind={def.piece} fill={pieceColour(def.piece, piece.sides[piece.side] ?? 0)} />
            </g>
          ) : null,
        )}
        <text x={60} y={208} textAnchor="middle" className="ck-pan__tray-count">
          {offCount}/{sim.pieces.length}
        </text>
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
            <PieceShape kind={def.piece} fill={pieceColour(def.piece, top)} />
            {reducedMotion ? null : (
              <path
                d="M-14 -40 q5 -8 0 -16 M0 -42 q5 -8 0 -16 M14 -40 q5 -8 0 -16"
                stroke="#ffffff"
                strokeWidth={2}
                opacity={0.35}
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
