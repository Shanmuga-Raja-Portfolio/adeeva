import type { GarmentSlot } from "../../content/garmentSlot";

export interface DollRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const anchors: Record<GarmentSlot, DollRect> = {
  neckline: { x: 168, y: 116, width: 64, height: 48 },
  "bodice-front": { x: 150, y: 166, width: 100, height: 58 },
  "bodice-back": { x: 156, y: 226, width: 88, height: 52 },
  "sleeve-left": { x: 98, y: 158, width: 48, height: 96 },
  "sleeve-right": { x: 254, y: 158, width: 48, height: 96 },
  "skirt-front": { x: 138, y: 282, width: 124, height: 106 },
  "skirt-back": { x: 126, y: 392, width: 148, height: 110 },
};

export function slotAnchor(slot: GarmentSlot): DollRect {
  return anchors[slot];
}

export function slotAtPoint(x: number, y: number): GarmentSlot | undefined {
  const entries = Object.entries(anchors) as [GarmentSlot, DollRect][];
  const hit = entries.find(
    ([, rect]) => x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height,
  );
  return hit?.[0];
}
