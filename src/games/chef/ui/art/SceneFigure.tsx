import type { AvatarLook } from "../../../../engine/avatar";
import { AvatarFigure, type AvatarGarment } from "../../../../ui/art/avatar/Avatar";
import type { AvatarPose } from "../../../../ui/art/avatar/ArmPose";
import type { AvatarMood } from "../../../../ui/art/avatar/AvatarFace";

const DOLL_FEET = 773;

export interface SceneFigureProps {
  readonly x: number;
  readonly feet: number;
  readonly scale: number;
  readonly facing: 1 | -1;
  readonly look: AvatarLook;
  readonly garment?: AvatarGarment | undefined;
  readonly pose: AvatarPose;
  readonly lean?: number | undefined;
  readonly mood?: AvatarMood | undefined;
  readonly className: string;
}

export function SceneFigure({
  x,
  feet,
  scale,
  facing,
  look,
  garment,
  pose,
  lean = 0,
  mood = "delighted",
  className,
}: SceneFigureProps) {
  const left = x - 200 * scale * facing;
  return (
    <g>
      <ellipse cx={x} cy={feet + 2} rx={160 * scale} ry={28 * scale} fill="#3a1d0c" opacity={0.38} />
      <ellipse cx={x} cy={feet + 2} rx={86 * scale} ry={15 * scale} fill="#2a1408" opacity={0.4} />
      <g transform={`rotate(${lean * facing} ${x} ${feet})`}>
        <g className={className}>
          <g transform={`translate(${left} ${feet - DOLL_FEET * scale}) scale(${scale * facing} ${scale})`}>
            <AvatarFigure look={look} garment={garment} mood={mood} pose={pose} />
          </g>
        </g>
      </g>
    </g>
  );
}
