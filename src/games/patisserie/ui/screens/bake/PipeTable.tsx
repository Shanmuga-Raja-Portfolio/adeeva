import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Point } from "../../../../../engine/geometry/point";
import { Button } from "../../../../../ui/kit/Button";
import { clientToSvg } from "../../../../../ui/kit/clientToSvg";
import { useElementSize } from "../../../../../ui/kit/useElementSize";
import type { PipePathDef } from "../../../content/pipePattern";
import { PIPE_CANVAS_CM } from "../../../content/pipeShape";
import {
  checkpoints,
  coverage,
  MAX_PIPE_SAMPLES,
  MIN_SAMPLE_SPACING_CM,
  pipeAccuracy,
  type Action,
} from "../../../core";
import { PipeSurface } from "../../art/PipeSurface";
import { snapToPath } from "./snapToPath";

export interface PipeTableProps {
  readonly path: PipePathDef;
  readonly tolerance: number;
  readonly assisted: boolean;
  readonly icing: string;
  readonly coat: string;
  readonly sponge: string;
  readonly reducedMotion: boolean;
  readonly dispatch: (action: Action) => boolean;
}

const KEY_STEP = 0.35;

function pathData(points: readonly Point[], closed: boolean): string {
  const body = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
  return closed ? `${body} Z` : body;
}

export function PipeTable({
  path,
  tolerance,
  assisted,
  icing,
  coat,
  sponge,
  reducedMotion,
  dispatch,
}: PipeTableProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pressing = useRef<number | null>(null);
  const samplesRef = useRef<readonly Point[]>([]);
  const keyIndex = useRef(0);
  const [samples, setSamples] = useState<readonly Point[]>([]);
  const [held, setHeld] = useState(false);
  const size = useElementSize(wrapRef, { width: 480, height: 480 });
  const pxPerCm = Math.max(1, size.width / PIPE_CANVAS_CM);
  const lineWidth = Math.max(0.6, 12 / pxPerCm);
  const marks = checkpoints(path);
  const covered = coverage(samples, path, tolerance);
  const accuracy = pipeAccuracy(samples, path, tolerance, assisted);
  const start = path.points[0] ?? [12, 12];

  const add = (raw: Point) => {
    const point = assisted ? snapToPath(path.points, path.closed, raw) : raw;
    const inside: Point = [
      Math.min(PIPE_CANVAS_CM, Math.max(0, point[0])),
      Math.min(PIPE_CANVAS_CM, Math.max(0, point[1])),
    ];
    const all = samplesRef.current;
    const last = all[all.length - 1];
    if (all.length >= MAX_PIPE_SAMPLES) return;
    if (last !== undefined && Math.hypot(inside[0] - last[0], inside[1] - last[1]) < MIN_SAMPLE_SPACING_CM)
      return;
    const next = [...all, inside];
    samplesRef.current = next;
    setSamples(next);
  };

  const addFrom = (event: PointerEvent<SVGSVGElement>) => {
    const native = event.nativeEvent;
    const events = typeof native.getCoalescedEvents === "function" ? native.getCoalescedEvents() : [];
    for (const source of events.length > 0 ? events : [native]) {
      const point = clientToSvg(svgRef.current, source.clientX, source.clientY);
      if (point !== null) add([point.x, point.y]);
    }
  };

  const down = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pressing.current = event.pointerId;
    setHeld(true);
    addFrom(event);
  };
  const move = (event: PointerEvent<SVGSVGElement>) => {
    if (pressing.current === event.pointerId) addFrom(event);
  };
  const up = (event: PointerEvent<SVGSVGElement>) => {
    if (pressing.current !== event.pointerId) return;
    pressing.current = null;
    setHeld(false);
  };
  const keyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (!assisted || event.key !== "ArrowRight") return;
    event.preventDefault();
    const index = Math.min(marks.length - 1, keyIndex.current);
    const mark = marks[index];
    if (mark === undefined) return;
    for (let step = 0; step * KEY_STEP < 1; step += 1) {
      const next = marks[index + 1] ?? mark;
      const share = step * KEY_STEP;
      add([mark[0] + (next[0] - mark[0]) * share, mark[1] + (next[1] - mark[1]) * share]);
    }
    keyIndex.current = index + 1;
  };
  const scrape = () => {
    samplesRef.current = [];
    keyIndex.current = 0;
    setSamples([]);
  };
  const keep = () => {
    dispatch({ type: "pipePath", pathId: path.id, samples: samplesRef.current, assisted });
  };
  const trail = samples
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
  return (
    <div className="pa-pipe-table">
      <div className="pa-pipe-table__stats" aria-live="polite">
        <span>
          <span className="ad-eyebrow">Covered</span>
          <strong>{Math.round(covered * 100)}%</strong>
        </span>
        <span>
          <span className="ad-eyebrow">On the line</span>
          <strong>{samples.length > 1 ? `${Math.round(accuracy * 100)}%` : "—"}</strong>
        </span>
      </div>
      <div
        ref={wrapRef}
        className={
          held ? "pa-pipe-table__turntable pa-pipe-table__turntable--squeeze" : "pa-pipe-table__turntable"
        }
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${PIPE_CANVAS_CM} ${PIPE_CANVAS_CM}`}
          className="pa-pipe-table__svg"
          role="application"
          aria-label={`Pipe the ${path.name.toLowerCase()} by tracing the dotted line${assisted ? ", or hold the right arrow key" : ""}`}
          tabIndex={0}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onKeyDown={keyDown}
          data-testid="pipe-table"
          data-path={JSON.stringify(path.points)}
          data-closed={path.closed ? "true" : "false"}
        >
          <circle cx={12} cy={12} r={11.95} fill="#e8edf3" />
          <PipeSurface path={path} coat={coat} sponge={sponge} />
          <path
            d={pathData(path.points, path.closed)}
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.55}
            strokeWidth={tolerance * 2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={pathData(path.points, path.closed)}
            fill="none"
            stroke="#4b5aa6"
            strokeWidth={0.16}
            strokeDasharray="0.12 0.42"
            strokeLinecap="round"
            className={reducedMotion ? undefined : "pa-pipe-table__march"}
          />
          <path
            d={trail}
            fill="none"
            stroke={icing}
            strokeWidth={lineWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={trail}
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.4}
            strokeWidth={lineWidth * 0.3}
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(-0.08 -0.08)"
          />
          {samples.length === 0 ? (
            <circle
              cx={start[0]}
              cy={start[1]}
              r={0.7}
              fill="#4b5aa6"
              className={reducedMotion ? undefined : "pa-pipe-table__start"}
            />
          ) : null}
        </svg>
      </div>
      <div className="pa-pipe-table__actions">
        <Button variant="secondary" onClick={scrape} disabled={samples.length === 0}>
          Scrape
        </Button>
        <Button onClick={keep} disabled={samples.length < 2} data-testid="keep-line">
          Keep this line
        </Button>
      </div>
      <p className="pa-hint">
        {held
          ? "Squeeze gently and follow the dots."
          : samples.length === 0
            ? "Start at the blue dot and trace all the way along."
            : "Lift any time, then carry on where you stopped."}
      </p>
    </div>
  );
}
