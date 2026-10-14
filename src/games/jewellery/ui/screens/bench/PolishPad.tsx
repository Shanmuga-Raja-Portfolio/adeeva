import { useRef, useState, type PointerEvent } from "react";
import { clamp } from "../../../../../engine/clamp";
import type { Point } from "../../../../../engine/geometry/point";
import { mixHex } from "../../../../../ui/art/colourMix";
import { seededUnit } from "../../../../../ui/art/seedFromText";
import { Button } from "../../../../../ui/kit/Button";
import { clientToSvg } from "../../../../../ui/kit/clientToSvg";
import { useElementWidth } from "../../../../../ui/kit/useElementSize";
import type { PartDef } from "../../../content/product";
import {
  designInput,
  emptyPolish,
  isPolished,
  partAccents,
  partOutline,
  POLISH_GRID,
  shineShare,
  type PieceRun,
  type PolishRecord,
} from "../../../core";
import { Glint } from "../../art/Glint";
import type { MetalLook } from "../../art/metalLook";
import { outlinePath } from "../../art/outlinePath";

interface PolishPadProps {
  readonly run: PieceRun;
  readonly part: PartDef;
  readonly mask: readonly boolean[];
  readonly record: PolishRecord | undefined;
  readonly metal: MetalLook;
  readonly assisted: boolean;
  readonly reducedMotion: boolean;
  readonly onStroke: (samples: readonly Point[], pxPerMm: number) => void;
  readonly onBuff: () => void;
  readonly onRestart: () => void;
  readonly next: { readonly name: string; readonly onPick: () => void } | null;
}

const CHUNK_PX = 90;

export function PolishPad({
  run,
  part,
  mask,
  record,
  metal,
  assisted,
  reducedMotion,
  onStroke,
  onBuff,
  onRestart,
  next,
}: PolishPadProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pointer = useRef<number | null>(null);
  const chunk = useRef<Point[]>([]);
  const travelled = useRef(0);
  const [cloth, setCloth] = useState<Point | null>(null);
  const loupePx = useElementWidth(wrapRef, 480);
  const elongated = part.width / part.height > 3;
  const viewW = elongated ? part.width * 1.15 : Math.max(part.width, part.height) * 1.3;
  const viewH = elongated ? part.height * 2.4 : viewW;
  const viewX = part.width / 2 - viewW / 2;
  const viewY = part.height / 2 - viewH / 2;
  const pxPerMm = Math.min(loupePx / viewW, loupePx / viewH);
  const size = Math.min(viewW, viewH);
  const current = record ?? emptyPolish();
  const input = designInput(run.design);
  const outline = partOutline(part, input);
  const holes = partAccents(part, input);
  const shape = [outlinePath(outline), ...holes.map((hole) => outlinePath(hole))].join(" ");
  const shine = shineShare(current, mask);
  const polished = isPolished(record, mask);
  const dull = mixHex(metal.mid, "#6f6a64", 0.55);
  const cellW = part.width / POLISH_GRID;
  const cellH = part.height / POLISH_GRID;

  const send = () => {
    const samples = chunk.current;
    if (samples.length >= 2) onStroke(samples, clamp(pxPerMm, 2, 40));
    chunk.current = samples.slice(-1);
    travelled.current = 0;
  };

  const add = (event: PointerEvent<SVGSVGElement>) => {
    const native = event.nativeEvent;
    const events = typeof native.getCoalescedEvents === "function" ? native.getCoalescedEvents() : [];
    for (const source of events.length > 0 ? events : [native]) {
      const point = clientToSvg(svgRef.current, source.clientX, source.clientY);
      if (point === null) continue;
      const next: Point = [point.x, point.y];
      const last = chunk.current[chunk.current.length - 1];
      if (last !== undefined) travelled.current += Math.hypot(next[0] - last[0], next[1] - last[1]) * pxPerMm;
      chunk.current = [...chunk.current, next].slice(-590);
      setCloth(next);
      if (travelled.current >= CHUNK_PX) send();
    }
  };

  const down = (event: PointerEvent<SVGSVGElement>) => {
    if (assisted) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointer.current = event.pointerId;
    chunk.current = [];
    travelled.current = 0;
    add(event);
  };
  const up = (event: PointerEvent<SVGSVGElement>) => {
    if (pointer.current !== event.pointerId) return;
    pointer.current = null;
    send();
    chunk.current = [];
    setCloth(null);
  };

  return (
    <div className="jb-polish-pad" data-testid="polish-pad" data-shine={shine.toFixed(3)}>
      <div className="jb-stats" aria-live="polite">
        <span>
          <span className="ad-eyebrow">Shining</span>
          <strong>{Math.round(shine * 100)}%</strong>
        </span>
        <span>
          <span className="ad-eyebrow">Needs</span>
          <strong>60%</strong>
        </span>
      </div>
      <div className="jb-loupe">
        <div className="jb-loupe__glass" ref={wrapRef}>
          <svg
            ref={svgRef}
            viewBox={`${viewX} ${viewY} ${viewW} ${viewH}`}
            preserveAspectRatio={elongated ? "none" : "xMidYMid meet"}
            onPointerDown={down}
            onPointerMove={(event) => {
              if (pointer.current === event.pointerId) add(event);
            }}
            onPointerUp={up}
            onPointerCancel={up}
            role="img"
            aria-label={`${part.name}: ${Math.round(shine * 100)}% shining`}
          >
            <defs>
              <clipPath id={`jb-polish-${part.key}`}>
                <path d={shape} clipRule="evenodd" />
              </clipPath>
            </defs>
            <path d={shape} fillRule="evenodd" fill={dull} stroke={metal.line} strokeWidth={size / 160} />
            <g clipPath={`url(#jb-polish-${part.key})`}>
              {mask.map((live, cell) => {
                if (!live) return null;
                const passes = current.passes[cell] ?? 0;
                const column = cell % POLISH_GRID;
                const row = Math.floor(cell / POLISH_GRID);
                const fill = passes >= 2 ? metal.light : passes === 1 ? metal.mid : dull;
                return (
                  <g key={cell}>
                    <rect
                      x={column * cellW}
                      y={row * cellH}
                      width={cellW + 0.02}
                      height={cellH + 0.02}
                      fill={fill}
                    />
                    {passes === 0
                      ? [0, 1, 2].map((dot) => (
                          <circle
                            key={dot}
                            cx={column * cellW + cellW * (0.2 + 0.6 * seededUnit(cell, dot))}
                            cy={row * cellH + cellH * (0.2 + 0.6 * seededUnit(cell, dot + 7))}
                            r={Math.min(cellW, cellH) * 0.07}
                            fill="#2a1d2c"
                            opacity={0.25}
                          />
                        ))
                      : null}
                    {passes >= 2 ? (
                      <Glint
                        x={column * cellW + cellW / 2}
                        y={row * cellH + cellH / 2}
                        size={Math.min(cellW, cellH) * 0.28}
                        twinkle={!reducedMotion}
                        delay={(cell % 5) * 0.3}
                      />
                    ) : null}
                  </g>
                );
              })}
            </g>
            {cloth !== null ? (
              <g transform={`translate(${cloth[0]} ${cloth[1]})`} className="jb-cloth" aria-hidden="true">
                <ellipse rx={32 / pxPerMm} ry={26 / pxPerMm} fill="#f2c4c9" opacity={0.85} />
                <ellipse rx={20 / pxPerMm} ry={14 / pxPerMm} fill="#fbe3e6" opacity={0.9} />
              </g>
            ) : null}
          </svg>
          <div className="jb-loupe__shine" aria-hidden="true" />
        </div>
      </div>
      <p className="jb-hint-line" aria-live="polite">
        {polished
          ? "It sparkles! Rub any last dull spots, or move on."
          : assisted
            ? "The buffing wheel can do it for you."
            : "Rub back and forth over the dull spots."}
      </p>
      <div className="jb-tools">
        {assisted ? (
          <Button
            size="lg"
            icon="sparkle"
            onClick={onBuff}
            disabled={record?.assisted === true}
            data-testid="buff"
          >
            Use the buffing wheel
          </Button>
        ) : null}
        <Button variant="secondary" onClick={onRestart} disabled={record === undefined || polished}>
          Restart this piece
        </Button>
        {polished && next !== null ? (
          <Button onClick={next.onPick} data-testid="polish-next">
            Next: {next.name}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
