import type { ReactNode, Ref } from "react";
import type { FabricDef } from "../../content/fabric";
import { darken, lighten } from "../../../../ui/art/colourMix";
import { FabricPattern, fabricFill, fabricSheenFill } from "../../../../ui/art/cloth/FabricPattern";
import { fabricLook } from "../../../../ui/art/cloth/fabricLook";
import { useSvgId } from "../../../../ui/art/useSvgId";

export interface FabricBoltProps {
  fabric?: FabricDef | undefined;
  widthCm: number;
  lengthCm: number;
  pxPerCm: number;
  showRuler?: boolean | undefined;
  title?: string | undefined;
  className?: string | undefined;
  svgRef?: Ref<SVGSVGElement> | undefined;
  children?: ReactNode;
}

export const BOLT_MARGIN = { left: 10, top: 11, right: 8, bottom: 3 } as const;

function rulerTicks(length: number, horizontal: boolean): ReactNode[] {
  const ticks: ReactNode[] = [];
  for (let cm = 0; cm <= length; cm += 1) {
    const size = cm % 10 === 0 ? 2.4 : cm % 5 === 0 ? 1.5 : 0.8;
    ticks.push(
      horizontal ? (
        <line key={cm} x1={cm} y1={-5} x2={cm} y2={-5 - size} />
      ) : (
        <line key={cm} x1={-3} y1={cm} x2={-3 - size} y2={cm} />
      ),
    );
  }
  return ticks;
}

function rulerLabels(length: number, horizontal: boolean): ReactNode[] {
  const labels: ReactNode[] = [];
  for (let cm = 10; cm <= length; cm += 10) {
    labels.push(
      horizontal ? (
        <text key={cm} x={cm} y={-8.4} textAnchor="middle">
          {cm}
        </text>
      ) : (
        <text key={cm} x={-5.9} y={cm + 0.6} textAnchor="end">
          {cm}
        </text>
      ),
    );
  }
  return labels;
}

export function FabricBolt({
  fabric,
  widthCm,
  lengthCm,
  pxPerCm,
  showRuler = true,
  title,
  className,
  svgRef,
  children,
}: FabricBoltProps) {
  const id = useSvgId("bolt");
  const look = fabric ? fabricLook(fabric) : undefined;
  const base = look ? look.base : "#efe6d4";
  const totalWidth = widthCm + BOLT_MARGIN.left + BOLT_MARGIN.right;
  const totalHeight = lengthCm + BOLT_MARGIN.top + BOLT_MARGIN.bottom;
  const label = title ?? (fabric ? `${fabric.name}, ${widthCm} by ${lengthCm} centimetres` : "Fabric layout");
  const pinHoles: ReactNode[] = [];
  for (let cm = 2; cm < lengthCm; cm += 3) {
    pinHoles.push(<circle key={`l${cm}`} cx={0.8} cy={cm} r={0.22} />);
    pinHoles.push(<circle key={`r${cm}`} cx={widthCm - 0.8} cy={cm} r={0.22} />);
  }
  const arrowTop = Math.min(12, lengthCm * 0.2);
  const arrowBottom = Math.max(arrowTop + 10, Math.min(lengthCm - 6, arrowTop + 40));
  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={`${-BOLT_MARGIN.left} ${-BOLT_MARGIN.top} ${totalWidth} ${totalHeight}`}
      width={totalWidth * pxPerCm}
      height={totalHeight * pxPerCm}
      role="img"
      aria-label={label}
    >
      <defs>
        {fabric ? <FabricPattern id={`${id}-fabric`} fabric={fabric} tile={6} /> : null}
        <linearGradient id={`${id}-roll`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={lighten(base, 0.35)} />
          <stop offset="0.45" stopColor={base} />
          <stop offset="1" stopColor={darken(base, 0.35)} />
        </linearGradient>
        <linearGradient id={`${id}-fall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c1220" stopOpacity={0.22} />
          <stop offset="0.06" stopColor="#1c1220" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={0.6} y={0.9} width={widthCm} height={lengthCm} fill="#1c1220" opacity={0.12} rx={0.4} />
      <rect x={0} y={0} width={widthCm} height={lengthCm} fill={fabric ? fabricFill(`${id}-fabric`) : base} />
      {fabric ? (
        <rect
          x={0}
          y={0}
          width={widthCm}
          height={lengthCm}
          fill={fabricSheenFill(`${id}-fabric`)}
          opacity={0.5}
        />
      ) : null}
      <rect x={0} y={0} width={widthCm} height={lengthCm} fill={`url(#${id}-fall)`} />
      <g fill={darken(base, 0.3)} opacity={0.55}>
        <rect x={0} y={0} width={1.6} height={lengthCm} opacity={0.35} />
        <rect x={widthCm - 1.6} y={0} width={1.6} height={lengthCm} opacity={0.35} />
        {pinHoles}
      </g>
      <path
        d={`M1.6 0 V${lengthCm} M${widthCm - 1.6} 0 V${lengthCm}`}
        stroke={darken(base, 0.4)}
        strokeWidth={0.12}
        strokeDasharray="0.6 0.4"
        opacity={0.6}
      />
      <rect x={-1.2} y={-3.4} width={widthCm + 2.4} height={4} rx={2} fill={`url(#${id}-roll)`} />
      <rect x={-2.2} y={-2.6} width={1.4} height={2.4} rx={0.5} fill="#c9b48a" />
      <rect x={widthCm + 0.8} y={-2.6} width={1.4} height={2.4} rx={0.5} fill="#c9b48a" />
      <g
        transform={`translate(${widthCm + 4.2} 0)`}
        stroke="#5b4f60"
        fill="none"
        strokeWidth={0.3}
        strokeLinecap="round"
      >
        <path
          d={`M0 ${arrowTop} V${arrowBottom} M-1.2 ${arrowTop + 2} L0 ${arrowTop} L1.2 ${arrowTop + 2} M-1.2 ${arrowBottom - 2} L0 ${arrowBottom} L1.2 ${arrowBottom - 2}`}
        />
        <text
          x={0}
          y={(arrowTop + arrowBottom) / 2}
          transform={`rotate(-90 0 ${(arrowTop + arrowBottom) / 2}) translate(0 -1.4)`}
          textAnchor="middle"
          fontSize={1.8}
          fill="#5b4f60"
          stroke="none"
          fontFamily="system-ui, sans-serif"
          letterSpacing={0.3}
        >
          GRAIN
        </text>
      </g>
      {showRuler ? (
        <g className="ad-bolt-ruler">
          <rect
            x={-0.2}
            y={-10.6}
            width={widthCm + 0.4}
            height={5.6}
            rx={0.8}
            fill="#fbf3dc"
            stroke="#d8c59a"
            strokeWidth={0.15}
          />
          <rect
            x={-9.6}
            y={-0.2}
            width={6.6}
            height={lengthCm + 0.4}
            rx={0.8}
            fill="#fbf3dc"
            stroke="#d8c59a"
            strokeWidth={0.15}
          />
          <g stroke="#7a6a4e" strokeWidth={0.14}>
            {rulerTicks(widthCm, true)}
            {rulerTicks(lengthCm, false)}
          </g>
          <g fill="#5b4f60" fontSize={1.7} fontFamily="system-ui, sans-serif">
            {rulerLabels(widthCm, true)}
            {rulerLabels(lengthCm, false)}
          </g>
          <text
            x={-6.3}
            y={-6.6}
            fontSize={1.6}
            fill="#a93d63"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
          >
            cm
          </text>
        </g>
      ) : null}
      {children}
    </svg>
  );
}
