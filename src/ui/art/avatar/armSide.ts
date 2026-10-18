import { createContext, useContext } from "react";

export type ArmSide = "left" | "right" | "both";

export const ArmSideContext = createContext<ArmSide>("both");

export function useArmSides(): readonly boolean[] {
  const side = useContext(ArmSideContext);
  if (side === "left") return [false];
  if (side === "right") return [true];
  return [false, true];
}
