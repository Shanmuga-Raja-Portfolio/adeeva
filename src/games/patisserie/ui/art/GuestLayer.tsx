import { useLayoutEffect, useRef } from "react";
import { useSvgId } from "../../../../ui/art/useSvgId";
import { SeatClip, SeatedGuest, type GuestSeat } from "./SeatedGuest";

const VIEW_WIDTH = 1200;
const VIEW_HEIGHT = 640;

export interface GuestLayerProps extends GuestSeat {
  readonly scale: number;
}

export function GuestLayer({ look, seat, index, scale }: GuestLayerProps) {
  const clipId = useSvgId("guest-seat");
  const layer = useRef<SVGSVGElement>(null);
  const figure = useRef<SVGGElement>(null);
  useLayoutEffect(() => {
    if (layer.current === null || figure.current === null) return;
    const box = figure.current.getBBox();
    const x = ((box.x + box.width / 2) / VIEW_WIDTH) * 100;
    const y = ((box.y + box.height) / VIEW_HEIGHT) * 100;
    layer.current.style.transformOrigin = `${x}% ${y}%`;
  }, [look, seat, scale]);
  return (
    <svg
      ref={layer}
      className={index % 2 === 0 ? "pa-guest-layer" : "pa-guest-layer pa-guest-layer--late"}
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      focusable="false"
    >
      <defs>
        <SeatClip id={clipId} />
      </defs>
      <g ref={figure}>
        <SeatedGuest look={look} seat={seat} index={index} scale={scale} clipId={clipId} />
      </g>
    </svg>
  );
}
