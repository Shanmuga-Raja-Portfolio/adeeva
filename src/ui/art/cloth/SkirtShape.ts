import type { GarmentShape } from "./GarmentShape";

const waist = "M165 274 Q200 279 235 274";

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function wavyHem(
  fromX: number,
  toX: number,
  count: number,
  baseY: (x: number) => number,
  depth: number,
): string {
  const step = (toX - fromX) / count;
  const parts: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const startX = fromX + step * index;
    const endX = startX + step;
    const midX = (startX + endX) / 2;
    parts.push(`Q${round(midX)} ${round(baseY(midX) + depth)} ${round(endX)} ${round(baseY(endX))}`);
  }
  return parts.join(" ");
}

interface Pleat {
  top: number;
  hem: number;
}

function pleatLines(pleats: readonly Pleat[], topY: number, hemY: (x: number) => number): string {
  return pleats
    .map(({ top, hem }) => {
      const span = hem - top;
      const bottom = round(hemY(hem));
      return `M${top} ${topY} C${round(top + span * 0.15)} ${round(topY + (bottom - topY) * 0.35)} ${round(hem - span * 0.12)} ${round(topY + (bottom - topY) * 0.7)} ${hem} ${bottom}`;
    })
    .join(" ");
}

function pleatShadows(
  pleats: readonly Pleat[],
  topY: number,
  hemY: (x: number) => number,
  width: number,
): string {
  return pleats
    .map(({ top, hem }) => {
      const span = hem - top;
      const bottom = round(hemY(hem));
      const outer = hem + width;
      const outerBottom = round(hemY(outer));
      return `M${top} ${topY} C${round(top + span * 0.15)} ${round(topY + (bottom - topY) * 0.35)} ${round(hem - span * 0.12)} ${round(topY + (bottom - topY) * 0.7)} ${hem} ${bottom} L${outer} ${outerBottom} C${round(outer - span * 0.1)} ${round(topY + (bottom - topY) * 0.7)} ${round(top + 3 + span * 0.16)} ${round(topY + (bottom - topY) * 0.35)} ${top + 3} ${topY} Z`;
    })
    .join(" ");
}

const ballgownHem = (x: number): number => 752 + 20 * (1 - ((x - 200) / 172) ** 2);
const ballgownPleats: readonly Pleat[] = [
  { top: 172, hem: 62 },
  { top: 182, hem: 118 },
  { top: 192, hem: 168 },
  { top: 204, hem: 222 },
  { top: 214, hem: 276 },
  { top: 226, hem: 330 },
];

const miniHem = (x: number): number => 396 + 6 * (1 - ((x - 200) / 92) ** 2);
const miniPleats: readonly Pleat[] = [
  { top: 178, hem: 132 },
  { top: 192, hem: 176 },
  { top: 208, hem: 224 },
  { top: 222, hem: 268 },
];

const aLineHem = (x: number): number => 520 + 16 * (1 - ((x - 200) / 86) ** 2);
const aLinePleats: readonly Pleat[] = [
  { top: 182, hem: 150 },
  { top: 200, hem: 198 },
  { top: 218, hem: 248 },
];

const skirtShapes: Record<string, GarmentShape[]> = {
  "a-line-skirt": [
    {
      d: `${waist} C248 330 266 430 286 520 Q200 552 114 520 C134 430 152 330 165 274 Z`,
      folds: pleatLines(aLinePleats, 282, aLineHem),
      shadows: `${pleatShadows(aLinePleats, 282, aLineHem, 12)} M114 520 C134 430 152 330 165 274 L172 276 C160 330 144 430 128 524 Z`,
      highlights: "M176 300 C170 380 160 450 150 516 M232 300 C240 380 250 450 262 512",
      seams: "M120 508 Q200 538 280 508 M166 284 Q200 289 234 284",
    },
  ],
  "ballgown-skirt": [
    {
      d: `${waist} C252 300 296 340 322 440 C346 530 364 650 372 752 ${wavyHem(372, 28, 8, ballgownHem, 12)} C36 650 54 530 78 440 C104 340 148 300 165 274 Z`,
      folds: pleatLines(ballgownPleats, 284, ballgownHem),
      shadows: `${pleatShadows(ballgownPleats, 284, ballgownHem, 22)} M28 752 C36 650 54 530 78 440 C104 340 148 300 165 274 L170 280 C130 330 96 420 74 520 C60 600 50 680 46 756 Z`,
      highlights:
        "M190 300 C170 400 150 520 140 700 M232 300 C258 400 290 520 310 700 M150 330 C120 420 100 520 90 620",
      seams: "M166 284 Q200 289 234 284",
    },
  ],
  "pencil-skirt": [
    {
      d: `${waist} C244 292 252 314 252 336 C252 400 246 480 240 562 Q200 568 160 562 C154 480 148 400 148 336 C148 314 156 292 165 274 Z`,
      folds: "M200 528 L200 566 M182 284 L184 316 M218 284 L216 316 M176 360 C180 400 184 440 186 480",
      shadows:
        "M148 336 C148 400 154 480 160 562 L172 563 C166 480 160 400 158 336 C158 314 162 296 168 282 L165 274 C156 292 148 314 148 336 Z M252 336 C252 400 246 480 240 562 L230 563 C236 480 242 400 243 336 Z M200 530 L194 566 L206 566 Z",
      highlights: "M162 320 C164 360 166 420 170 480 M232 320 C234 340 236 360 236 380",
      seams: "M162 554 Q200 560 238 554 M166 284 Q200 289 234 284",
    },
  ],
  "mini-skirt": [
    {
      d: `${waist} C250 300 272 350 292 398 ${wavyHem(292, 108, 6, miniHem, 9)} C128 350 150 300 165 274 Z`,
      folds: pleatLines(miniPleats, 282, miniHem),
      shadows: `${pleatShadows(miniPleats, 282, miniHem, 12)} M108 398 C128 350 150 300 165 274 L172 278 C156 310 138 352 122 400 Z`,
      highlights: "M180 296 C170 330 158 360 146 390 M226 296 C236 330 248 360 262 388",
      seams: "M166 284 Q200 289 234 284",
    },
  ],
};

export function skirtShape(skirtId: string): GarmentShape[] {
  return skirtShapes[skirtId] ?? [];
}
