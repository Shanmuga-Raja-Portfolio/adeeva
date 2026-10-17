import { Icon, type IconName } from "../../../../../ui/kit/IconSet";

export interface SceneView {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface SceneSpotProps {
  readonly view: SceneView;
  readonly area: SceneView;
  readonly label: string;
  readonly icon: IconName;
  readonly onClick: () => void;
  readonly testId: string;
}

function share(value: number, total: number): string {
  return `${(value / total) * 100}%`;
}

export function SceneSpot({ view, area, label, icon, onClick, testId }: SceneSpotProps) {
  return (
    <button
      type="button"
      className="ck-spot"
      style={{
        left: share(area.x - view.x, view.width),
        top: share(area.y - view.y, view.height),
        width: share(area.width, view.width),
        height: share(area.height, view.height),
      }}
      onClick={onClick}
      data-testid={testId}
    >
      <span className="ck-spot__tag">
        <Icon name={icon} size={22} />
        <span className="ck-spot__label">{label}</span>
      </span>
    </button>
  );
}
