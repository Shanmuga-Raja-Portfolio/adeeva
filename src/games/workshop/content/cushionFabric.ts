import type { ColourId, MaterialId, PrintId } from "../../../engine/palette";

export const CUSHION_FABRIC_IDS = [
  "sage-linen",
  "sky-gingham",
  "blush-floral",
  "mustard-dot",
  "ivory-cotton",
  "navy-stripe-linen",
] as const;
export type CushionFabricId = (typeof CUSHION_FABRIC_IDS)[number];

export interface CushionFabricDef {
  readonly id: CushionFabricId;
  readonly name: string;
  readonly colour: ColourId;
  readonly material: MaterialId;
  readonly print: PrintId;
  readonly price: number;
}

export const CUSHION_FABRICS: readonly CushionFabricDef[] = [
  { id: "sage-linen", name: "Sage Linen", colour: "sage", material: "linen", print: "solid", price: 14 },
  { id: "sky-gingham", name: "Sky Gingham", colour: "sky", material: "cotton", print: "check", price: 11 },
  {
    id: "blush-floral",
    name: "Blush Floral",
    colour: "blush",
    material: "cotton",
    print: "floral",
    price: 12,
  },
  { id: "mustard-dot", name: "Mustard Dot", colour: "mustard", material: "cotton", print: "dot", price: 11 },
  { id: "ivory-cotton", name: "Ivory Cotton", colour: "ivory", material: "cotton", print: "solid", price: 9 },
  {
    id: "navy-stripe-linen",
    name: "Navy Stripe Linen",
    colour: "navy",
    material: "linen",
    print: "stripe",
    price: 15,
  },
];
