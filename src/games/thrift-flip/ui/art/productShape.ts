import type { Design } from "../../core";

export type Mount = "hanger" | "clip" | "hook" | "stand" | "stool" | "peg";

export interface ProductShape {
  readonly mount: Mount;
  readonly bodies: readonly string[];
  readonly seams: readonly string[];
  readonly shade: readonly string[];
}

function scallop(cx: number, cy: number, r: number, bumps: number): string {
  const points: string[] = [];
  for (let index = 0; index <= bumps * 2; index += 1) {
    const angle = (index / (bumps * 2)) * Math.PI * 2;
    const radius = index % 2 === 0 ? r : r * 0.86;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius * 0.8;
    points.push(`${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `${points.join(" ")} Z`;
}

function ring(cx: number, cy: number, r: number): string {
  const inner = r * 0.46;
  return `${scallop(cx, cy, r, 11)} M${cx + inner} ${cy} A${inner} ${inner * 0.8} 0 1 0 ${cx - inner} ${cy} A${inner} ${inner * 0.8} 0 1 0 ${cx + inner} ${cy} Z`;
}

const SKIRTS: Readonly<Record<string, string>> = {
  "mini-skirt": "M146 96 L254 96 L258 112 L304 236 Q200 256 96 236 L142 112 Z",
  "a-line-skirt": "M150 96 L250 96 L254 112 L300 322 Q200 340 100 322 L146 112 Z",
  "pencil-skirt": "M150 96 L250 96 L256 112 L262 200 L252 332 L148 332 L138 200 L144 112 Z",
};

const BODICES: Readonly<Record<string, string>> = {
  "fitted-bodice": "M150 96 Q200 128 250 96 L282 110 L268 166 L262 302 Q200 314 138 302 L132 166 L118 110 Z",
  "wrap-bodice":
    "M150 96 Q186 124 214 196 Q232 130 250 96 L282 110 L268 166 L264 302 Q200 316 136 302 L132 166 L118 110 Z",
};

function top(design: Design): ProductShape {
  const bodice = BODICES[design.parts.bodice ?? "fitted-bodice"] ?? BODICES["fitted-bodice"] ?? "";
  const caps = design.parts.sleeves === "cap-sleeve";
  const sleeves = caps
    ? ["M118 110 L84 160 Q100 178 128 170 L132 150 Z", "M282 110 L316 160 Q300 178 272 170 L268 150 Z"]
    : [];
  const wrap = design.parts.bodice === "wrap-bodice" ? ["M150 96 Q190 140 214 196"] : [];
  return {
    mount: "hanger",
    bodies: [...sleeves, bodice],
    seams: ["M136 296 Q200 306 264 296", "M134 166 Q200 182 266 166", ...wrap],
    shade: ["M140 176 Q160 240 146 296"],
  };
}

function skirt(design: Design): ProductShape {
  const partId = design.parts.skirt ?? "a-line-skirt";
  const body = SKIRTS[partId] ?? SKIRTS["a-line-skirt"] ?? "";
  return {
    mount: "clip",
    bodies: [body],
    seams: [
      "M144 112 L256 112",
      partId === "pencil-skirt" ? "M150 324 L250 324" : "M110 300 Q200 318 290 300",
    ],
    shade: [partId === "pencil-skirt" ? "M170 120 L166 320" : "M178 118 L150 300 M222 118 L250 300"],
  };
}

export function productShape(design: Design): ProductShape {
  switch (design.recipeId) {
    case "remade-top":
      return top(design);
    case "remade-skirt":
      return skirt(design);
    case "tote-bag":
      return {
        mount: "hook",
        bodies: [
          "M140 178 Q140 70 200 70 Q260 70 260 178 L246 178 Q246 86 200 86 Q154 86 154 178 Z",
          "M112 170 L288 170 L300 344 Q200 360 100 344 Z",
        ],
        seams: ["M116 190 L284 190", "M108 330 Q200 344 292 330"],
        shade: ["M128 200 L120 336"],
      };
    case "bucket-hat":
      return {
        mount: "stand",
        bodies: [
          "M76 238 Q200 196 324 238 Q330 262 200 270 Q70 262 76 238 Z",
          "M126 232 Q130 130 200 124 Q270 130 274 232 Q200 250 126 232 Z",
        ],
        seams: ["M130 210 Q200 228 270 210", "M90 244 Q200 222 310 244"],
        shade: ["M150 220 Q150 150 186 134"],
      };
    case "cushion-cover":
      return {
        mount: "stool",
        bodies: ["M96 112 Q200 92 304 112 Q324 220 304 316 Q200 336 96 316 Q76 220 96 112 Z"],
        seams: [
          "M110 126 Q200 110 290 126 Q306 220 290 302 Q200 318 110 302 Q94 220 110 126 Z",
          "M98 200 Q200 230 302 200",
        ],
        shade: ["M116 140 Q104 220 116 296"],
      };
    case "scrunchie-trio":
      return {
        mount: "peg",
        bodies: [ring(200, 300, 74), ring(200, 222, 66), ring(200, 150, 58)],
        seams: [],
        shade: [],
      };
    case null:
      return { mount: "hanger", bodies: [], seams: [], shade: [] };
  }
}
