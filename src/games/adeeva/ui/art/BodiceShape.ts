import type { GarmentShape } from "../../../../ui/art/cloth/GarmentShape";

const neckCurves: Record<string, string> = {
  "sweetheart-neckline": "L232 202 C228 186 210 184 200 206 C190 184 172 186 168 202 L180 152",
  "peter-pan-collar": "C214 166 207 170 200 170 C193 170 186 166 180 152",
  "high-collar": "C214 158 207 160 200 160 C193 160 186 158 180 152",
};

const scoopCurve = "C216 176 208 186 200 186 C192 186 184 176 180 152";

function neckCurve(necklineId: string | undefined): string {
  return (necklineId !== undefined ? neckCurves[necklineId] : undefined) ?? scoopCurve;
}

function outline(shoulder: number, waist: string, necklineId: string | undefined): string {
  const right = 400 - shoulder;
  return [
    `M180 152 L${shoulder} 159`,
    `C${shoulder - 4} 176 142 196 145 210`,
    "C149 232 155 250 160 262 C163 268 164 272 164 278",
    waist,
    "C236 272 237 268 240 262 C245 250 251 232 255 210",
    `C258 196 ${right + 4} 176 ${right} 159 L220 152`,
    neckCurve(necklineId),
    "Z",
  ].join(" ");
}

const fittedShape = (necklineId: string | undefined): GarmentShape[] => [
  {
    d: outline(154, "Q200 284 236 278", necklineId),
    folds: "M166 160 C170 192 176 224 180 280 M234 160 C230 192 224 224 220 280",
    shadows:
      "M150 224 C168 242 188 240 199 228 C192 248 166 252 148 238 Z M250 224 C232 242 212 240 201 228 C208 248 234 252 252 238 Z M146 210 C150 236 158 258 164 278 L170 278 C164 256 156 234 150 212 Z",
    highlights: "M160 200 C168 192 182 194 188 204 M212 204 C218 194 232 192 240 200",
    seams: "M166 273 Q200 279 234 273 M156 166 C152 180 148 196 149 208 M244 166 C248 180 252 196 251 208",
  },
];

const corsetShape = (necklineId: string | undefined): GarmentShape[] => [
  {
    d: outline(162, "C180 282 194 292 200 304 C206 292 220 282 236 278", necklineId),
    folds:
      "M172 214 C176 240 178 262 180 288 M186 216 C188 246 190 272 192 298 M214 216 C212 246 210 272 208 298 M228 214 C224 240 222 262 220 288",
    shadows:
      "M146 212 C150 234 158 256 164 278 L178 284 C170 258 160 234 154 212 Z M254 212 C250 234 242 256 236 278 L222 284 C230 258 240 234 246 212 Z",
    highlights: "M179 222 C181 244 183 264 185 286 M221 222 C219 244 217 264 215 286",
    seams: "M166 272 C182 278 194 288 200 297 C206 288 218 278 234 272",
    cords:
      "M195 226 L205 236 M205 226 L195 236 M195 238 L205 248 M205 238 L195 248 M195 250 L205 260 M205 250 L195 260 M195 262 L205 272 M205 262 L195 272 M195 274 L205 284 M205 274 L195 284",
  },
];

const wrapShape = (necklineId: string | undefined): GarmentShape[] => [
  {
    d: outline(154, "Q200 286 236 280", necklineId),
    folds:
      "M184 162 C194 198 214 236 238 266 M232 262 C214 248 200 234 192 212 M226 266 C206 256 190 244 178 228 M216 270 C198 264 180 254 166 242",
    shadows:
      "M164 262 Q200 268 236 262 L236 281 Q200 287 164 281 Z M184 162 C194 198 214 236 238 266 L238 274 C210 244 190 206 180 164 Z",
    highlights: "M189 162 C199 196 218 232 240 258 M170 206 C176 200 184 200 190 206",
    seams: "M164 265 Q200 271 236 265",
  },
  {
    d: "M234 268 C244 252 262 254 260 268 C258 278 246 278 238 274 Z M236 274 C246 284 254 302 250 320 L243 318 C245 304 240 290 234 278 Z M234 276 C236 292 234 306 228 322 L235 324 C241 308 241 290 238 276 Z M232 270 C232 264 240 264 241 270 C241 276 233 278 232 270 Z",
    folds: "M240 268 C246 262 254 262 256 266",
    highlights: "M240 262 C246 256 254 256 257 262",
  },
];

const bodiceShapes: Record<string, (necklineId: string | undefined) => GarmentShape[]> = {
  "fitted-bodice": fittedShape,
  "corset-bodice": corsetShape,
  "wrap-bodice": wrapShape,
};

export function bodiceShape(bodiceId: string, necklineId: string | undefined): GarmentShape[] {
  const build = bodiceShapes[bodiceId];
  return build ? build(necklineId) : [];
}
