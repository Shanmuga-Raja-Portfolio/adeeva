import { memo } from "react";
import { AvatarFigure } from "../../../../ui/art/avatar/Avatar";
import type { AvatarPose } from "../../../../ui/art/avatar/ArmPose";
import { ACCESSORIES, OUTFIT_STYLES, type AvatarLook } from "../../../../engine/avatar";
import { RUNWAY_VIEW } from "../../../adeeva/ui/art/runwayGeometry";
import { BOUTIQUE_CLIENTS } from "../../content/boutiqueClient";
import { CLIENTS } from "../../content/client";
import { SWAP_NEIGHBOURS } from "../../content/swapNeighbour";

const { width: W, height: H, farFeet: FAR } = RUNWAY_VIEW;
const HIPS = 380;
const TOP = 120;
const VIEW_HEIGHT = 640;

interface Row {
  readonly floor: number;
  readonly xs: readonly number[];
}

const ROWS: readonly Row[] = [
  { floor: 478, xs: [262, 362, 462, 562] },
  { floor: 606, xs: [118, 262, 406, 548] },
  { floor: 790, xs: [150, 360] },
];

const LOOKS: readonly AvatarLook[] = [
  ...SWAP_NEIGHBOURS.map((entry) => entry.look),
  ...CLIENTS.map((entry) => entry.look),
  ...BOUTIQUE_CLIENTS.map((entry) => entry.look),
];

const POSES: readonly AvatarPose[] = [
  "rest",
  "cheer",
  "chat",
  "wave",
  "graceful",
  "poised-right",
  "cheer",
  "point",
  "graceful-right",
  "poised",
  "wave",
];

function standingHeight(floor: number): number {
  return 190 + ((floor - 430) / (H - FAR)) * 370;
}

function Bench({
  left,
  right,
  floor,
  h,
}: {
  readonly left: number;
  readonly right: number;
  readonly floor: number;
  readonly h: number;
}) {
  const seat = floor - h * 0.25;
  const plank = h * 0.035;
  const apron = h * 0.16;
  return (
    <g>
      <ellipse
        cx={(left + right) / 2}
        cy={floor}
        rx={(right - left) / 2 + h * 0.05}
        ry={h * 0.03}
        fill="#2b1a10"
        opacity={0.35}
      />
      {[left + h * 0.04, right - h * 0.04].map((x) => (
        <rect key={x} x={x - h * 0.012} y={seat} width={h * 0.024} height={floor - seat} fill="#5b3a1e" />
      ))}
      <rect x={left} y={seat - plank} width={right - left} height={plank} rx={plank / 3} fill="#b88b5e" />
      <rect x={left} y={seat - plank} width={right - left} height={plank * 0.35} fill="#e0bb8a" />
      <rect x={left + h * 0.01} y={seat} width={right - left - h * 0.02} height={apron} fill="#8a6340" />
      <rect
        x={left + h * 0.01}
        y={seat}
        width={right - left - h * 0.02}
        height={apron * 0.18}
        fill="#3b2a1c"
        opacity={0.25}
      />
    </g>
  );
}

function SeatedRow({
  row,
  index,
  mirror,
}: {
  readonly row: Row;
  readonly index: number;
  readonly mirror: boolean;
}) {
  const h = standingHeight(row.floor);
  const scale = h / 800;
  const seat = row.floor - h * 0.25;
  const xs = row.xs.map((x) => (mirror ? W - x : x));
  const half = 64 * scale;
  return (
    <g>
      {xs.map((x, seatIndex) => {
        const pick = index * 7 + seatIndex * 3 + (mirror ? 5 : 0);
        const base = LOOKS[pick % LOOKS.length];
        if (base === undefined) return null;
        const look: AvatarLook = {
          ...base,
          outfit: OUTFIT_STYLES[(pick * 2 + seatIndex) % OUTFIT_STYLES.length] ?? base.outfit,
        };
        const accessory = pick % 4 === 1 ? ACCESSORIES[(pick + seatIndex) % ACCESSORIES.length] : undefined;
        const turned = (pick + seatIndex) % 3 === 0;
        return (
          <svg
            key={x}
            x={x - 200 * scale}
            y={seat - (HIPS + TOP) * scale}
            width={400 * scale}
            height={VIEW_HEIGHT * scale}
            viewBox={`0 ${-TOP} 400 ${VIEW_HEIGHT}`}
          >
            <g transform={turned ? "translate(400 0) scale(-1 1)" : undefined}>
              <AvatarFigure
                look={look}
                mood={pick % 3 === 0 ? "delighted" : "happy"}
                accessory={accessory}
                pose={POSES[(pick + seatIndex * 2) % POSES.length]}
              />
            </g>
          </svg>
        );
      })}
      <Bench
        left={Math.min(...xs) - half - 40 * scale}
        right={Math.max(...xs) + half + 40 * scale}
        floor={row.floor}
        h={h}
      />
    </g>
  );
}

function Audience() {
  return (
    <g>
      {ROWS.map((row, index) => (
        <g key={row.floor}>
          <SeatedRow row={row} index={index} mirror={false} />
          <SeatedRow row={row} index={index} mirror />
        </g>
      ))}
    </g>
  );
}

export const HallAudience = memo(Audience);
