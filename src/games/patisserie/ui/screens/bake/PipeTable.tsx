import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Point } from "../../../../../engine/geometry/point";
import { darken, lighten } from "../../../../../ui/art/colourMix";
import { Button } from "../../../../../ui/kit/Button";
import { Meter } from "../../../../../ui/kit/Meter";
import { StarRating } from "../../../../../ui/kit/StarRating";
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

function neatWord(accuracy: number): string {
  if (accuracy >= 0.9) return "Super neat!";
  if (accuracy >= 0.7) return "Neat";
  if (accuracy >= 0.5) return "A bit wobbly";
  return "Wobbly";
}

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
        <Meter
          label="How far you have piped"
          value={Math.round(covered * 100)}
          valueText={`${Math.round(covered * 100)}%`}
        />
        <div className="pa-pipe-table__neat">
          <span className="ad-meter__row">
            <span className="ad-meter__label">How neat it is</span>
            <span className="ad-meter__value">{samples.length > 1 ? neatWord(accuracy) : "—"}</span>
          </span>
          <StarRating stars={samples.length > 1 ? Math.round(accuracy * 5) : 0} size={22} />
        </div>
        <p className="pa-pipe-table__tip">
          {held
            ? "Squeeze gently and follow the dots."
            : samples.length === 0
              ? "Start at the blue dot and trace all the way along."
              : "Lift any time, then carry on where you stopped."}
        </p>
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
            stroke="#4b5aa6"
            strokeOpacity={0.12}
            strokeWidth={tolerance * 2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={pathData(path.points, path.closed)}
            fill="none"
            stroke="#ffffff"
            strokeWidth={0.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={pathData(path.points, path.closed)}
            fill="none"
            stroke="#2f3c86"
            strokeWidth={0.3}
            strokeDasharray="0.02 0.52"
            strokeLinecap="round"
            className={reducedMotion ? undefined : "pa-pipe-table__march"}
          />
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path
              d={trail}
              stroke="#3b2620"
              strokeOpacity={0.22}
              strokeWidth={lineWidth * 1.15}
              transform="translate(0.1 0.18)"
            />
            <path d={trail} stroke={darken(icing, 0.24)} strokeWidth={lineWidth * 1.14} />
            <path d={trail} stroke={icing} strokeWidth={lineWidth} />
            <path
              d={trail}
              stroke={darken(icing, 0.1)}
              strokeWidth={lineWidth * 0.78}
              strokeLinecap="butt"
              strokeDasharray={`${(lineWidth * 0.14).toFixed(3)} ${(lineWidth * 0.36).toFixed(3)}`}
            />
            <path
              d={trail}
              stroke={lighten(icing, 0.7)}
              strokeOpacity={0.75}
              strokeWidth={lineWidth * 0.26}
              transform="translate(-0.07 -0.09)"
            />
          </g>
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
    </div>
  );
}
