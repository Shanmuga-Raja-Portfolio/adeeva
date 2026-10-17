import { RUNWAY_VIEW, runwayDepth } from "./runwayGeometry";

export interface WalkerFrame {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly feet: number;
  readonly centre: number;
}

const FEET_RATIO = 772 / 800;

export function walkerFrame(progress: number, lateral = 0, stride = true): WalkerFrame {
  const depth = runwayDepth(progress);
  const eased = depth * depth * (3 - 2 * depth);
  const height = 190 + eased * 370;
  const width = height / 2;
  const feet = RUNWAY_VIEW.farFeet + eased * (RUNWAY_VIEW.nearFeet - RUNWAY_VIEW.farFeet);
  const bob = stride ? Math.abs(Math.sin(progress * Math.PI * 18)) * height * 0.008 : 0;
  const centre = 800 + lateral * (0.3 + 0.7 * eased);
  return { x: centre - width / 2, y: feet - height * FEET_RATIO - bob, width, height, feet, centre };
}
