import {
  MAX_DECORATION_SCALE,
  MIN_DECORATION_SCALE,
  trimById,
  type Action,
  type Decoration,
  type DecorationPose,
} from "../../../core";
import { Button } from "../../../../../ui/kit/Button";
import { clampPose, poseOf } from "./decorationPose";

export interface DecorationControlsProps {
  readonly decoration: Decoration | undefined;
  readonly all: readonly Decoration[];
  readonly dispatch: (action: Action) => void;
  readonly onDeselect: () => void;
}

export function DecorationControls({ decoration, all, dispatch, onDeselect }: DecorationControlsProps) {
  if (decoration === undefined) {
    return (
      <div className="ad-deco-controls ad-deco-controls--empty">
        <strong>Placing trims</strong>
        <p className="ad-muted">
          Drag a trim onto the dress, or tap it to pin it to the bodice. Tap a placed trim to move, turn or
          resize it with the handles or the buttons here.
        </p>
      </div>
    );
  }
  const others = all.filter((entry) => entry.id !== decoration.id);
  const update = (change: Partial<DecorationPose>) => {
    const pose = clampPose({ ...poseOf(decoration), ...change });
    dispatch({ type: "moveDecoration", decorationId: decoration.id, ...pose });
  };
  const top = others.reduce((highest, entry) => Math.max(highest, entry.layer), 0);
  const bottom = others.reduce((lowest, entry) => Math.min(lowest, entry.layer), top);
  const name = trimById(decoration.trimId).name;
  return (
    <div className="ad-deco-controls" aria-label={`${name} controls`}>
      <header>
        <strong>{name}</strong>
        <span className="ad-muted">
          {Math.round(decoration.rotation)}° · {Math.round(decoration.scale * 100)}%
        </span>
      </header>
      <div className="ad-deco-controls__grid">
        <Button
          variant="secondary"
          onClick={() => update({ rotation: decoration.rotation - 15 })}
          aria-label="Turn left"
        >
          ↺ 15°
        </Button>
        <Button
          variant="secondary"
          onClick={() => update({ rotation: decoration.rotation + 15 })}
          aria-label="Turn right"
        >
          ↻ 15°
        </Button>
        <Button
          variant="secondary"
          onClick={() => update({ scale: decoration.scale - 0.1 })}
          disabled={decoration.scale <= MIN_DECORATION_SCALE}
          aria-label="Smaller"
        >
          − Size
        </Button>
        <Button
          variant="secondary"
          onClick={() => update({ scale: decoration.scale + 0.1 })}
          disabled={decoration.scale >= MAX_DECORATION_SCALE}
          aria-label="Bigger"
        >
          + Size
        </Button>
        <Button
          variant="secondary"
          onClick={() => update({ layer: top + 1 })}
          disabled={others.length === 0 || decoration.layer > top}
        >
          To front
        </Button>
        <Button
          variant="secondary"
          onClick={() => update({ layer: Math.max(0, bottom - 1) })}
          disabled={others.length === 0 || decoration.layer < bottom}
        >
          To back
        </Button>
      </div>
      <div className="ad-deco-controls__footer">
        <Button
          variant="ghost"
          onClick={() => {
            dispatch({ type: "removeDecoration", decorationId: decoration.id });
            onDeselect();
          }}
        >
          Return to tray
        </Button>
        <Button variant="ghost" onClick={onDeselect}>
          Done
        </Button>
      </div>
    </div>
  );
}
