import { useRef, useState, type MouseEvent, type PointerEvent, type RefObject } from "react";
import { clientToSvg, type SvgPoint } from "../../../ui/kit/clientToSvg";

interface ActiveDrag<T> {
  readonly payload: T;
  readonly spot: SvgPoint | null;
  readonly moved: boolean;
  readonly clientX: number;
  readonly clientY: number;
}

export interface DragHandlers {
  readonly onPointerDown: (event: PointerEvent<Element>) => void;
  readonly onPointerMove: (event: PointerEvent<Element>) => void;
  readonly onPointerUp: (event: PointerEvent<Element>) => void;
  readonly onPointerCancel: () => void;
  readonly onClick: (event: MouseEvent<Element>) => void;
}

interface Tracking<T> extends ActiveDrag<T> {
  readonly startX: number;
  readonly startY: number;
  readonly pointerId: number;
}

const DRAG_THRESHOLD = 6;

export function usePointerDrag<T>(
  surface: RefObject<SVGSVGElement | null>,
  onDrop: (payload: T, spot: SvgPoint | null) => void,
  onTap: (payload: T) => void,
): { readonly active: ActiveDrag<T> | null; readonly handlers: (payload: T) => DragHandlers } {
  const [active, setActive] = useState<ActiveDrag<T> | null>(null);
  const tracking = useRef<Tracking<T> | null>(null);

  const locate = (event: PointerEvent<Element>) => clientToSvg(surface.current, event.clientX, event.clientY);

  const handlers = (payload: T): DragHandlers => ({
    onPointerDown: (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      const next: Tracking<T> = {
        payload,
        spot: locate(event),
        moved: false,
        clientX: event.clientX,
        clientY: event.clientY,
        startX: event.clientX,
        startY: event.clientY,
        pointerId: event.pointerId,
      };
      tracking.current = next;
      setActive({ payload, spot: next.spot, moved: false, clientX: event.clientX, clientY: event.clientY });
    },
    onPointerMove: (event) => {
      const drag = tracking.current;
      if (drag === null || drag.pointerId !== event.pointerId) return;
      const moved =
        drag.moved || Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > DRAG_THRESHOLD;
      const spot = locate(event);
      tracking.current = { ...drag, spot, moved, clientX: event.clientX, clientY: event.clientY };
      setActive({ payload: drag.payload, spot, moved, clientX: event.clientX, clientY: event.clientY });
    },
    onPointerUp: (event) => {
      const drag = tracking.current;
      if (drag === null || drag.pointerId !== event.pointerId) return;
      tracking.current = null;
      setActive(null);
      if (drag.moved) onDrop(drag.payload, locate(event));
      else onTap(drag.payload);
    },
    onPointerCancel: () => {
      tracking.current = null;
      setActive(null);
    },
    onClick: (event) => {
      if (event.detail === 0) onTap(payload);
    },
  });

  return { active, handlers };
}
