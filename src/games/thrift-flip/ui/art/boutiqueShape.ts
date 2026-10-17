import type { Design } from "../../core";
import type { ProductShape } from "./productShape";

function bow(cx: number, cy: number, s: number): string[] {
  const left = `M${cx} ${cy} C${cx - 40 * s} ${cy - 50 * s} ${cx - 92 * s} ${cy - 34 * s} ${cx - 84 * s} ${cy} C${cx - 92 * s} ${cy + 34 * s} ${cx - 40 * s} ${cy + 50 * s} ${cx} ${cy} Z`;
  const right = `M${cx} ${cy} C${cx + 40 * s} ${cy - 50 * s} ${cx + 92 * s} ${cy - 34 * s} ${cx + 84 * s} ${cy} C${cx + 92 * s} ${cy + 34 * s} ${cx + 40 * s} ${cy + 50 * s} ${cx} ${cy} Z`;
  const tails = `M${cx - 8 * s} ${cy + 8 * s} L${cx - 34 * s} ${cy + 74 * s} L${cx - 18 * s} ${cy + 66 * s} L${cx - 10 * s} ${cy + 82 * s} L${cx + 2 * s} ${cy + 12 * s} Z M${cx + 8 * s} ${cy + 8 * s} L${cx + 34 * s} ${cy + 74 * s} L${cx + 18 * s} ${cy + 66 * s} L${cx + 10 * s} ${cy + 82 * s} L${cx - 2 * s} ${cy + 12 * s} Z`;
  const knot = `M${cx - 13 * s} ${cy - 15 * s} Q${cx} ${cy - 20 * s} ${cx + 13 * s} ${cy - 15 * s} L${cx + 13 * s} ${cy + 15 * s} Q${cx} ${cy + 20 * s} ${cx - 13 * s} ${cy + 15 * s} Z`;
  return [tails, left, right, knot];
}

function bowSeams(cx: number, cy: number, s: number): string[] {
  return [
    `M${cx - 14 * s} ${cy} C${cx - 40 * s} ${cy - 28 * s} ${cx - 70 * s} ${cy - 20 * s} ${cx - 72 * s} ${cy}`,
    `M${cx + 14 * s} ${cy} C${cx + 40 * s} ${cy - 28 * s} ${cx + 70 * s} ${cy - 20 * s} ${cx + 72 * s} ${cy}`,
  ];
}

function pennants(): string[] {
  return Array.from({ length: 6 }, (_, index) => {
    const t = (index + 0.5) / 6;
    const x = 40 + 320 * t;
    const y = 96 + 4 * 70 * t * (1 - t);
    return `M${(x - 24).toFixed(1)} ${(y - 2).toFixed(1)} L${(x + 24).toFixed(1)} ${(y + 2).toFixed(1)} L${x.toFixed(1)} ${(y + 74).toFixed(1)} Z`;
  });
}

const PINAFORE_BODICES: Readonly<Record<string, string>> = {
  "fitted-bodice":
    "M150 104 L176 104 L184 132 Q200 140 216 132 L224 104 L250 104 L258 212 Q200 224 142 212 Z",
  "wrap-bodice": "M150 104 L176 104 Q192 150 206 176 Q214 140 224 104 L250 104 L258 212 Q200 224 142 212 Z",
};

const PINAFORE_SKIRTS: Readonly<Record<string, string>> = {
  "a-line-skirt": "M144 206 L256 206 L306 342 Q200 362 94 342 Z",
  "mini-skirt": "M144 206 L256 206 L292 296 Q200 314 108 296 Z",
};

function pinafore(design: Design): ProductShape {
  const bodice =
    PINAFORE_BODICES[design.parts.bodice ?? "fitted-bodice"] ?? PINAFORE_BODICES["fitted-bodice"] ?? "";
  const skirtId = design.parts.skirt ?? "a-line-skirt";
  const skirt = PINAFORE_SKIRTS[skirtId] ?? PINAFORE_SKIRTS["a-line-skirt"] ?? "";
  const hem = skirtId === "mini-skirt" ? "M114 288 Q200 306 286 288" : "M102 334 Q200 352 298 334";
  return {
    mount: "hanger",
    bodies: [skirt, bodice],
    seams: ["M146 210 Q200 222 254 210", hem, "M163 104 L171 132", "M237 104 L229 132"],
    shade: ["M170 220 L150 330 M230 220 L250 330"],
  };
}

export function boutiqueShape(design: Design): ProductShape | null {
  switch (design.recipeId) {
    case "hair-bow-set":
      return {
        mount: "clip",
        backing: ["M120 70 L280 70 L280 350 Q200 362 120 350 Z"],
        bodies: [...bow(200, 160, 0.92), ...bow(200, 280, 0.78)],
        seams: [...bowSeams(200, 160, 0.92), ...bowSeams(200, 280, 0.78)],
        shade: [],
      };
    case "book-sleeve":
      return {
        mount: "stool",
        bodies: [
          "M110 122 Q110 108 124 108 L276 108 Q290 108 290 122 L290 302 Q290 316 276 316 L124 316 Q110 316 110 302 Z",
          "M110 112 L290 112 L290 184 Q200 222 110 184 Z",
        ],
        seams: ["M122 124 L278 124 L278 304 L122 304 Z", "M122 120 L278 120 L278 178 Q200 210 122 178 Z"],
        shade: ["M126 196 Q118 250 126 300"],
      };
    case "bunting-string":
      return {
        mount: "hook",
        bodies: ["M36 92 Q200 168 364 92 L364 102 Q200 178 36 102 Z", ...pennants()],
        seams: ["M36 97 Q200 173 364 97"],
        shade: [],
      };
    case "garden-apron":
      return {
        mount: "hanger",
        bodies: [
          "M104 206 Q60 236 66 312 L80 312 Q78 244 112 220 Z",
          "M296 206 Q340 236 334 312 L320 312 Q322 244 288 220 Z",
          "M160 108 L240 108 L248 206 L152 206 Z",
          "M104 200 L296 200 L310 340 Q200 358 90 340 Z",
        ],
        seams: [
          "M166 116 L234 116 L240 200 L160 200 Z",
          "M168 246 L232 246 L232 300 L168 300 Z",
          "M106 208 L294 208",
        ],
        shade: ["M120 214 L110 332"],
      };
    case "patch-throw":
      return {
        mount: "hook",
        bodies: ["M80 60 L320 60 L330 340 Q200 358 70 340 Z"],
        seams: [
          "M160 62 L158 348",
          "M240 62 L242 348",
          "M76 152 L324 152",
          "M74 246 L328 246",
          "M90 70 L310 70 L318 330 Q200 346 82 330 Z",
        ],
        shade: ["M96 80 L88 330", "M300 80 L310 330"],
      };
    case "remade-pinafore":
      return pinafore(design);
    default:
      return null;
  }
}
