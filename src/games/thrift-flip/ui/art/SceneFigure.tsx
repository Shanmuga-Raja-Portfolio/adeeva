import { Avatar } from "../../../../ui/art/avatar/Avatar";
import type { AvatarPose } from "../../../../ui/art/avatar/ArmPose";
import type { AvatarLook } from "../../../../engine/avatar";

export interface Spot {
  readonly x: number;
  readonly feet: number;
  readonly size: number;
  readonly pose: AvatarPose;
  readonly lean: number;
  readonly flip: boolean;
  readonly far: boolean;
}

export interface SceneFigureProps {
  readonly look: AvatarLook;
  readonly spot: Spot;
  readonly name: string;
  readonly delay: number;
}

const FEET = 772 / 800;

export function SceneFigure({ look, spot, name, delay }: SceneFigureProps) {
  const { x, feet, size, pose, lean, flip, far } = spot;
  const width = size / 2;
  return (
    <g className={far ? "tf-figure tf-figure--far" : "tf-figure"}>
      <ellipse
        cx={x - size * 0.13}
        cy={feet + size * 0.012}
        rx={size * 0.24}
        ry={size * 0.03}
        fill="#3b2a1c"
        opacity={0.16}
        transform={`skewX(-28) translate(${(feet + size * 0.012) * Math.tan((28 * Math.PI) / 180)} 0)`}
      />
      <ellipse cx={x} cy={feet} rx={size * 0.12} ry={size * 0.024} fill="#3b2a1c" opacity={0.32} />
      <g transform={`rotate(${lean} ${x} ${feet})`}>
        <g className="tf-idle" style={{ animationDelay: `${delay}ms` }}>
          <g transform={flip ? `translate(${2 * x} 0) scale(-1 1)` : undefined}>
            <svg x={x - width / 2} y={feet - size * FEET} width={width} height={size} overflow="visible">
              <Avatar look={look} variant="full" size={size} title={name} pose={pose} mood="happy" />
            </svg>
          </g>
        </g>
      </g>
    </g>
  );
}
