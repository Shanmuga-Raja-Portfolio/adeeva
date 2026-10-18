import { memo } from "react";
import { AvatarFigure } from "../../../../ui/art/avatar/Avatar";
import { handPoint, type AvatarPose } from "../../../../ui/art/avatar/ArmPose";
import { DOLL_VIEWBOX } from "../../../../ui/art/avatar/Croquis";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { AccessoryId, AvatarLook } from "../../../../engine/avatar";
import type { AvatarMood } from "../../../../ui/art/avatar/AvatarFace";
import { ToteBag } from "./ToteBag";

export interface Spot {
  readonly x: number;
  readonly feet: number;
  readonly size: number;
  readonly pose: AvatarPose;
  readonly lean: number;
  readonly flip: boolean;
  readonly far: boolean;
  readonly build?: number | undefined;
  readonly bag?: string | undefined;
  readonly tilt?: number | undefined;
  readonly mood?: AvatarMood | undefined;
  readonly accessory?: AccessoryId | undefined;
  readonly talk?: "left" | "right" | undefined;
}

export interface SceneFigureProps {
  readonly look: AvatarLook;
  readonly spot: Spot;
  readonly name: string;
  readonly delay: number;
}

const HIP = 430;
const LEGS = 0.74;
const SOLE = 772;
const FEET = (HIP + (SOLE - HIP) * LEGS) / 800;

function squash(y: number): number {
  return y <= HIP ? y : HIP + (y - HIP) * LEGS;
}

function bagSide(pose: AvatarPose): "left" | "right" {
  return pose === "carry-right" ? "right" : "left";
}

function Figure({ look, spot, name, delay }: SceneFigureProps) {
  const id = useSvgId("figure");
  const { x, feet, size, pose, lean, flip, far, build = 1, bag, tilt = 0, mood = "happy", accessory } = spot;
  const width = size / 2;
  const hand = handPoint(pose, bagSide(pose));
  return (
    <g className={far ? "tf-figure tf-figure--far" : "tf-figure"}>
      <ellipse
        cx={x - size * 0.12}
        cy={feet + size * 0.01}
        rx={size * 0.22}
        ry={size * 0.028}
        fill="#3b2a1c"
        opacity={0.16}
        transform={`skewX(-28) translate(${(feet + size * 0.01) * Math.tan((28 * Math.PI) / 180)} 0)`}
      />
      <ellipse cx={x} cy={feet} rx={size * 0.15} ry={size * 0.03} fill="#3b2a1c" opacity={0.22} />
      <ellipse
        cx={x}
        cy={feet - size * 0.004}
        rx={size * 0.085}
        ry={size * 0.014}
        fill="#2a1b10"
        opacity={0.42}
      />
      <g transform={`rotate(${lean} ${x} ${feet})`}>
        <g className="tf-idle" style={{ animationDelay: `${delay}ms` }}>
          <g transform={`translate(${x} 0) scale(${flip ? -build : build} 1) translate(${-x} 0)`}>
            <svg
              x={x - width / 2}
              y={feet - size * FEET}
              width={width}
              height={size}
              viewBox={DOLL_VIEWBOX}
              overflow="visible"
              role="img"
              aria-label={name}
            >
              <defs>
                <g id={`${id}-doll`}>
                  <AvatarFigure look={look} mood={mood} pose={pose} accessory={accessory} headTilt={tilt} />
                </g>
                <clipPath id={`${id}-top`}>
                  <rect x={-400} y={-400} width={1200} height={400 + HIP + 0.6} />
                </clipPath>
                <clipPath id={`${id}-legs`}>
                  <rect x={-400} y={HIP - 0.6} width={1200} height={1200} />
                </clipPath>
              </defs>
              <use href={`#${id}-doll`} clipPath={`url(#${id}-top)`} />
              <g transform={`translate(0 ${HIP}) scale(1 ${LEGS}) translate(0 ${-HIP})`}>
                <use href={`#${id}-doll`} clipPath={`url(#${id}-legs)`} />
              </g>
              {bag === undefined ? null : (
                <ToteBag x={hand[0]} y={squash(hand[1])} colour={bag} flip={bagSide(pose) === "right"} />
              )}
            </svg>
          </g>
        </g>
      </g>
    </g>
  );
}

export const SceneFigure = memo(Figure);
