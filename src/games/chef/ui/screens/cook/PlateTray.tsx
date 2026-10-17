import type { KeyboardEvent, PointerEvent } from "react";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ComponentId } from "../../../content/plateComponent";
import { componentById } from "../../../core";
import { ComponentArt } from "../../art/ComponentArt";

export interface PlateTrayProps {
  readonly ids: readonly ComponentId[];
  readonly placed: ReadonlySet<ComponentId>;
  readonly onBegin: (event: PointerEvent<Element>, componentId: ComponentId) => void;
  readonly onMove: (event: PointerEvent<Element>) => void;
  readonly onEnd: (event: PointerEvent<Element>) => void;
  readonly onCancel: () => void;
  readonly onPlace: (componentId: ComponentId) => void;
}

export function PlateTray({ ids, placed, onBegin, onMove, onEnd, onCancel, onPlace }: PlateTrayProps) {
  const keyDown = (event: KeyboardEvent<HTMLButtonElement>, id: ComponentId) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onPlace(id);
  };
  return (
    <div
      className={ids.length > 4 ? "ck-plate__tray ck-plate__tray--many" : "ck-plate__tray"}
      role="group"
      aria-label="Parts of the dish"
    >
      {ids.map((id) => {
        const component = componentById(id);
        const on = placed.has(id);
        return (
          <button
            key={id}
            type="button"
            className={`ck-tray-item ck-tray-item--${component.role}${on ? " ck-tray-item--on" : ""}`}
            onPointerDown={(event) => onBegin(event, id)}
            onPointerMove={onMove}
            onPointerUp={onEnd}
            onPointerCancel={onCancel}
            onKeyDown={(event) => keyDown(event, id)}
            data-testid={`tray-${id}`}
          >
            <span className="ck-tray-item__dish" aria-hidden="true">
              <svg viewBox={`-6 -6 ${component.width + 12} ${component.height + 12}`}>
                <ComponentArt componentId={id} />
              </svg>
            </span>
            <span className="ck-tray-item__name">{component.name}</span>
            <span className={`ck-tray-item__role ck-tray-item__role--${component.role}`}>
              {component.role}
            </span>
            {on ? (
              <span className="ck-tray-item__on" aria-hidden="true">
                <Icon name="check" size={14} />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
