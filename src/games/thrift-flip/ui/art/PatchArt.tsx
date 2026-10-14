import type { Cloth } from "../../../../ui/art/cloth/Cloth";
import { FabricPattern, fabricFill } from "../../../../ui/art/cloth/FabricPattern";
import { fabricLook } from "../../../../ui/art/cloth/fabricLook";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { PatchId } from "../../content/finish";

export const PATCH_SIZE = 40;

export const PATCH_PATHS: Readonly<Record<PatchId, string>> = {
  "patch-heart":
    "M0 17 C -6 11 -19 4 -19 -6 C -19 -14 -12 -19 -6 -19 C -2 -19 0 -16 0 -13 C 0 -16 2 -19 6 -19 C 12 -19 19 -14 19 -6 C 19 4 6 11 0 17 Z",
  "patch-star":
    "M0 -20 L5.9 -8.1 L19 -6.2 L9.5 3.1 L11.8 16.2 L0 10 L-11.8 16.2 L-9.5 3.1 L-19 -6.2 L-5.9 -8.1 Z",
  "patch-round": "M0 -18 A18 18 0 1 1 -0.01 -18 Z",
  "patch-square": "M-16 -16 L16 -16 L16 16 L-16 16 Z",
  "patch-leaf": "M0 -20 C 14 -12 18 4 0 20 C -18 4 -14 -12 0 -20 Z M0 -14 L0 16",
  "patch-flower":
    "M0 -8 C 4 -20 16 -14 8 -4 C 20 -4 18 10 6 6 C 10 18 -4 20 -2 8 C -12 18 -20 6 -8 2 C -20 -6 -8 -16 0 -8 Z",
  "patch-pocket": "M-17 -14 L17 -14 L17 10 Q17 18 9 18 L-9 18 Q-17 18 -17 10 Z M-17 -6 L17 -6",
};

export interface PatchArtProps {
  readonly patchId: PatchId;
  readonly cloth: Cloth;
}

export function PatchArt({ patchId, cloth }: PatchArtProps) {
  const id = useSvgId("patch");
  const look = fabricLook(cloth);
  const path = PATCH_PATHS[patchId];
  return (
    <g className="tf-patch">
      <defs>
        <FabricPattern id={`${id}-fabric`} fabric={cloth} tile={10} />
      </defs>
      <path d={path} fill="#2b2230" opacity={0.18} transform="translate(1.2 2)" />
      <path d={path} fill={fabricFill(`${id}-fabric`)} stroke={look.deep} strokeWidth={1.2} />
      <path
        d={path}
        fill="none"
        stroke={look.dark ? "#fff3dd" : "#5b3a1e"}
        strokeWidth={1.3}
        strokeDasharray="2.6 2.2"
        transform="scale(0.8)"
        strokeLinecap="round"
      />
    </g>
  );
}
