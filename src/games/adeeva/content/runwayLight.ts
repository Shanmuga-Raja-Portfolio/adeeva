export const RUNWAY_LIGHTS = [
  { id: "warm", name: "Warm Glow" },
  { id: "cool", name: "Cool Wash" },
  { id: "spotlight", name: "Spotlight" },
] as const;
export type RunwayLightId = (typeof RUNWAY_LIGHTS)[number]["id"];
