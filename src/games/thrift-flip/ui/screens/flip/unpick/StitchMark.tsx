export interface StitchMarkProps {
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly popped: boolean;
  readonly next: boolean;
  readonly snags: number;
  readonly threadId: string;
  readonly reducedMotion: boolean;
}

const HOLE_CM = 0.78;
const SIZE = 1.5;

const TWISTS = [-0.45, -0.15, 0.15, 0.45];
const SPARKS = [0, 45, 90, 135, 180, 225, 270, 315];
const SPARK_COLOURS = ["#ffd27a", "#ffffff", "#f08a3c", "#ffffff"];
const THREAD = `M${-HOLE_CM} 0 Q0 -0.14 ${HOLE_CM} 0`;

function Hole({ x, open }: { readonly x: number; readonly open: boolean }) {
  return (
    <g>
      <ellipse
        cx={x}
        cy={0.04}
        rx={open ? 0.18 : 0.34}
        ry={open ? 0.14 : 0.24}
        fill="#2a1b10"
        opacity={0.18}
      />
      <circle cx={x} cy={0.02} r={open ? 0.15 : 0.12} fill="#ffffff" opacity={0.5} />
      <circle cx={x} cy={0} r={open ? 0.12 : 0.1} fill="#2a1b10" opacity={0.7} />
    </g>
  );
}

function Snap() {
  return (
    <g className="tf-stitch__snap">
      <circle className="tf-stitch__ring" r={1.1} fill="none" stroke="#ffd27a" strokeWidth={0.2} />
      <path
        className="tf-stitch__curl"
        d={`M${-HOLE_CM} 0 q0.5 -0.9 -0.1 -1.6 q-0.5 -0.6 0.3 -1.3`}
        fill="none"
        stroke="#d9432a"
        strokeWidth={0.18}
        strokeLinecap="round"
      />
      <path
        className="tf-stitch__curl tf-stitch__curl--late"
        d={`M${HOLE_CM} 0 q-0.5 -0.9 0.1 -1.6 q0.5 -0.6 -0.3 -1.3`}
        fill="none"
        stroke="#d9432a"
        strokeWidth={0.18}
        strokeLinecap="round"
      />
      <g className="tf-stitch__spark">
        {SPARKS.map((turn, index) => (
          <path
            key={turn}
            d={index % 2 === 0 ? "M0 -1 V-2.1" : "M0 -0.9 V-1.5"}
            stroke={SPARK_COLOURS[index % SPARK_COLOURS.length]}
            strokeWidth={0.22}
            strokeLinecap="round"
            transform={`rotate(${turn})`}
          />
        ))}
      </g>
    </g>
  );
}

export function StitchMark({ x, y, angle, popped, next, snags, threadId, reducedMotion }: StitchMarkProps) {
  if (popped) {
    return (
      <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${SIZE})`}>
        <Hole x={-HOLE_CM} open />
        <Hole x={HOLE_CM} open />
        <path
          d={`M${-HOLE_CM - 0.1} 0.05 q-0.3 0.35 -0.1 0.62`}
          fill="none"
          stroke="#c23a24"
          strokeWidth={0.1}
          strokeLinecap="round"
          opacity={0.85}
        />
        <path
          d={`M${HOLE_CM + 0.1} -0.05 q0.32 -0.3 0.14 -0.6`}
          fill="none"
          stroke="#c23a24"
          strokeWidth={0.1}
          strokeLinecap="round"
          opacity={0.85}
        />
        {reducedMotion ? null : <Snap />}
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${SIZE})`}>
      {next ? (
        <g>
          <circle r={1.6} fill="#fff6dc" opacity={0.45} />
          <circle className="tf-stitch__target" r={1.6} fill="none" strokeWidth={0.13} />
        </g>
      ) : null}
      <path
        d={THREAD}
        fill="none"
        stroke="#fff8ec"
        strokeOpacity={0.6}
        strokeWidth={0.42}
        strokeLinecap="round"
      />
      <Hole x={-HOLE_CM} open={false} />
      <Hole x={HOLE_CM} open={false} />
      <path
        d={`M${-HOLE_CM} 0.14 Q0 0.22 ${HOLE_CM} 0.14`}
        fill="none"
        stroke="#2a1b10"
        strokeOpacity={0.24}
        strokeWidth={0.18}
        strokeLinecap="round"
      />
      <path
        d={THREAD}
        fill="none"
        stroke="#4a1208"
        strokeOpacity={0.8}
        strokeWidth={0.27}
        strokeLinecap="round"
      />
      <path
        className="tf-stitch__thread"
        d={THREAD}
        fill="none"
        stroke={`url(#${threadId})`}
        strokeWidth={0.18}
        strokeLinecap="round"
      />
      {TWISTS.map((twist) => (
        <path
          key={twist}
          d={`M${twist - 0.04} 0.0 L${twist + 0.04} -0.13`}
          stroke="#6e1a0e"
          strokeOpacity={0.55}
          strokeWidth={0.04}
        />
      ))}
      <path
        d={`M${-HOLE_CM + 0.15} -0.08 Q0 -0.16 ${HOLE_CM - 0.15} -0.08`}
        fill="none"
        stroke="#ffe3d8"
        strokeOpacity={0.9}
        strokeWidth={0.05}
        strokeLinecap="round"
      />
      {snags > 0 ? (
        <circle r={1.4} fill="none" stroke="#c0392b" strokeWidth={0.14} strokeDasharray="0.35 0.25" />
      ) : null}
    </g>
  );
}
