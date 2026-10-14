import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { FabricPattern, fabricFill } from "../../../../../../ui/art/cloth/FabricPattern";
import { useSvgId } from "../../../../../../ui/art/useSvgId";
import { clientToSvg } from "../../../../../../ui/kit/clientToSvg";
import { useTickLoop } from "../../../../../../ui/kit/useTickLoop";
import type { CushionFabricDef } from "../../../../content/cushionFabric";
import { CUSHION_SEAM_BOUNDS, isNeedleOnSeam, seamLineAt } from "../../../../core";
import type { FollowProgress } from "../../../../../../engine/followRecord";

interface CushionSeamProps {
  readonly fabric: CushionFabricDef;
  readonly seam: FollowProgress | null;
  readonly band: number;
  readonly assisted: boolean;
  readonly onRecord: (sample: FollowProgress) => void;
}

const SEAM_SECONDS = 8;
const PROGRESS_PER_TICK = 1 / (SEAM_SECONDS * 60);
const RECORD_EVERY = 30;
const WIDTH = 400;
const HEIGHT = 120;
const NEEDLE_X = 120;
const VIEW_SPAN = 0.35;
const OFFSET_RANGE = 0.32;

function yFor(offset: number): number {
  return HEIGHT / 2 + (offset / OFFSET_RANGE) * (HEIGHT / 2 - 12);
}

export function CushionSeam({ fabric, seam, band, assisted, onRecord }: CushionSeamProps) {
  const id = useSvgId("ww-seam");
  const svgRef = useRef<SVGSVGElement>(null);
  const live = useRef({
    progress: seam?.progress ?? 0,
    ticks: seam?.ticks ?? 0,
    inside: seam?.insideTicks ?? 0,
    pending: 0,
  });
  const [progress, setProgress] = useState(seam?.progress ?? 0);
  const [offset, setOffset] = useState(0);
  const [sewing, setSewing] = useState(false);
  const offsetRef = useRef(0);
  const done = progress >= CUSHION_SEAM_BOUNDS.units;

  const flush = () => {
    const current = live.current;
    if (current.pending === 0) return;
    current.pending = 0;
    onRecord({
      progress: Math.min(CUSHION_SEAM_BOUNDS.units, current.progress),
      ticks: current.ticks,
      insideTicks: current.inside,
      assisted,
    });
  };

  useTickLoop(sewing && !done, (count) => {
    const current = live.current;
    for (let tick = 0; tick < count; tick += 1) {
      if (current.progress >= CUSHION_SEAM_BOUNDS.units) break;
      current.progress = Math.min(CUSHION_SEAM_BOUNDS.units, current.progress + PROGRESS_PER_TICK);
      current.ticks += 1;
      current.pending += 1;
      if (isNeedleOnSeam(current.progress, offsetRef.current, band)) current.inside += 1;
    }
    setProgress(current.progress);
    if (current.pending >= RECORD_EVERY || current.progress >= CUSHION_SEAM_BOUNDS.units) flush();
    if (current.progress >= CUSHION_SEAM_BOUNDS.units) {
      setSewing(false);
      return false;
    }
    return true;
  });

  const steer = (clientX: number, clientY: number) => {
    const point = clientToSvg(svgRef.current, clientX, clientY);
    if (point === null) return;
    const next = Math.max(
      -OFFSET_RANGE,
      Math.min(OFFSET_RANGE, ((point.y - HEIGHT / 2) / (HEIGHT / 2 - 12)) * OFFSET_RANGE),
    );
    offsetRef.current = next;
    setOffset(next);
  };

  const down = (event: PointerEvent<SVGSVGElement>) => {
    if (done) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    steer(event.clientX, event.clientY);
    setSewing(true);
  };

  const stop = () => {
    setSewing(false);
    flush();
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = Math.max(
        -OFFSET_RANGE,
        Math.min(OFFSET_RANGE, offsetRef.current + (event.key === "ArrowUp" ? -0.03 : 0.03)),
      );
      offsetRef.current = next;
      setOffset(next);
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (sewing) stop();
      else if (!done) setSewing(true);
    }
  };

  const ahead = Array.from({ length: 41 }, (_, index) => {
    const share = index / 40;
    const at = progress - VIEW_SPAN * 0.3 + share * VIEW_SPAN;
    return `${(share * WIDTH).toFixed(1)} ${yFor(seamLineAt(at)).toFixed(1)}`;
  });
  const sewnUntil = (NEEDLE_X / WIDTH) * 41;
  const onLine = isNeedleOnSeam(progress, offset, band);
  return (
    <div className="ww-seam">
      <svg
        ref={svgRef}
        className="ww-seam__strip"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        tabIndex={0}
        role="slider"
        aria-label="Cushion seam. Hold to sew and steer the needle onto the chalk line. Space starts and stops, arrow keys steer."
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        onPointerDown={down}
        onPointerMove={(event) => (sewing ? steer(event.clientX, event.clientY) : undefined)}
        onPointerUp={stop}
        onPointerCancel={stop}
        onKeyDown={onKey}
        data-testid="cushion-seam"
        data-progress={String(progress)}
      >
        <defs>
          <FabricPattern id={id} fabric={fabric} tile={26} />
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill={fabricFill(id)} />
        <rect width={WIDTH} height={HEIGHT} fill="#ffffff" opacity={0.25} />
        <path
          d={`M${ahead.join(" L")}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth={3.5}
          strokeDasharray="7 5"
          opacity={0.95}
        />
        <path
          d={`M${ahead.slice(0, Math.max(1, Math.floor(sewnUntil))).join(" L")}`}
          fill="none"
          stroke="#2f2622"
          strokeWidth={2.2}
          strokeDasharray="4 3"
        />
        {assisted ? (
          <rect
            x={NEEDLE_X - 4}
            y={yFor(offset) - band * 150}
            width={8}
            height={band * 300}
            fill="#4a6378"
            opacity={0.2}
          />
        ) : null}
        <g
          transform={`translate(${NEEDLE_X} ${yFor(offset)})`}
          className={sewing ? "ww-seam__needle ww-seam__needle--busy" : "ww-seam__needle"}
        >
          <line x1={0} y1={-60} x2={0} y2={-6} stroke="#9aa4ad" strokeWidth={3} />
          <circle r={5} fill={onLine ? "#3f6b4f" : "#c0392b"} stroke="#2f2622" strokeWidth={1.5} />
        </g>
      </svg>
      <div className="ww-seam__bar" aria-hidden="true">
        <span style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </div>
  );
}
