import type { OutfitStyleId } from "../../../engine/avatar";
import type { ColourId, MaterialId, PrintId } from "../../../engine/palette";
import { ButtonArt, type ButtonKind } from "../cloth/ButtonArt";
import type { Cloth } from "../cloth/Cloth";
import { darken } from "../colourMix";
import { FabricPattern } from "../cloth/FabricPattern";
import { fabricLook } from "../cloth/fabricLook";
import { GarmentPiece } from "../cloth/GarmentPiece";
import type { GarmentShape } from "../cloth/GarmentShape";
import { skirtShape } from "../cloth/SkirtShape";

type OutfitRole = "top" | "outer" | "bottom";

interface OutfitPiece {
  role: OutfitRole;
  shape: GarmentShape;
}

interface OutfitDesign {
  fabrics: Record<OutfitRole, Cloth>;
  body: OutfitPiece[];
  sleeves: OutfitPiece[];
  buttons?: { x: number; y: number; trim: ButtonKind; tint: string }[];
}

function cloth(id: string, material: MaterialId, colour: ColourId, print: PrintId): Cloth {
  return { id, material, colour, print };
}

const teeBody: GarmentShape = {
  d: "M180 152 L154 159 C150 176 142 196 145 210 C148 236 152 258 155 280 C155 296 152 306 150 318 Q200 326 250 318 C248 306 245 296 245 280 C248 258 252 236 255 210 C258 196 250 176 246 159 L220 152 C214 164 207 169 200 169 C193 169 186 164 180 152 Z",
  folds: "M172 290 C180 296 190 298 198 296 M232 230 C226 250 224 270 226 290",
  seams: "M152 312 Q200 320 248 312 M184 154 C188 162 194 165 200 165 C206 165 212 162 216 154",
};

const teeSleeve: GarmentShape = {
  d: "M157 159 C140 152 124 160 120 182 C118 196 118 210 119 224 L142 228 C144 214 146 204 148 196 Z",
  seams: "M120 216 L142 220",
  shadows: "M148 196 C146 206 144 216 142 228 L136 227 C138 216 140 206 142 196 Z",
};

const longSleeve: GarmentShape = {
  d: "M157 159 C136 152 123 168 122 192 C121 230 118 270 116 300 C113 330 110 360 106 388 L123 392 C126 360 130 330 133 300 C136 270 140 240 147 212 Z",
  folds: "M120 286 C124 290 128 292 132 290 M128 200 C126 240 122 270 120 290",
  seams: "M107 378 L123 382",
  shadows:
    "M133 300 C136 270 140 240 147 212 L141 214 C136 246 132 276 128 304 C125 334 121 364 117 391 L123 392 C126 360 130 330 133 300 Z",
};

const trousers: GarmentShape = {
  d: "M164 274 Q200 279 236 274 C244 300 250 320 250 340 C250 460 247 600 246 712 L208 712 C206 600 204 480 201 392 L199 392 C196 480 194 600 192 712 L154 712 C153 600 150 460 150 340 C150 320 156 300 164 274 Z",
  folds: "M176 300 C174 420 172 560 172 708 M224 300 C226 420 228 560 228 708 M199 300 L199 380",
  shadows:
    "M201 392 C204 480 206 600 208 712 L216 712 C212 600 208 480 204 392 Z M150 340 C150 460 153 600 154 712 L162 712 C160 600 158 460 158 340 Z",
  seams: "M165 284 Q200 289 235 284 M156 702 L192 702 M208 702 L246 702",
};

const apron: GarmentShape = {
  d: "M172 204 L228 204 L232 268 C244 330 252 420 256 502 Q200 514 144 502 C148 420 156 330 168 268 Z M172 206 L179 154 L186 154 L178 206 Z M228 206 L221 154 L214 154 L222 206 Z",
  folds: "M184 300 C182 380 178 440 172 504 M216 300 C218 380 222 440 228 504",
  seams:
    "M176 210 L224 210 M182 372 L218 372 L218 404 L182 404 Z M200 372 L200 404 M148 494 Q200 506 252 494",
  shadows: "M144 502 C148 420 156 330 168 268 L174 270 C164 330 156 420 152 504 Z",
};

const apronTie: GarmentShape = {
  d: "M160 264 L240 264 L240 274 L160 274 Z M240 266 C252 268 258 280 254 296 L249 294 C251 282 248 274 240 272 Z",
  seams: "M162 269 L238 269",
};

function jacketPanels(hem: number, opening: number): string {
  const right = 400 - opening;
  return `M180 152 L152 159 C147 176 141 196 143 210 C146 240 150 272 150 300 C150 314 149 ${hem - 8} 149 ${hem} L${opening} ${hem + 6} C${opening - 2} 300 ${opening - 4} 260 ${opening - 2} 230 C190 210 186 180 180 152 Z M220 152 L248 159 C253 176 259 196 257 210 C254 240 250 272 250 300 C250 314 251 ${hem - 8} 251 ${hem} L${right} ${hem + 6} C${right + 2} 300 ${right + 4} 260 ${right + 2} 230 C210 210 214 180 220 152 Z`;
}

const denimJacket: GarmentShape = {
  d: jacketPanels(326, 194),
  seams:
    "M152 196 C166 200 180 200 192 198 M248 196 C234 200 220 200 208 198 M160 212 L184 212 L184 224 L160 224 Z M216 212 L240 212 L240 224 L216 224 Z M150 316 L193 322 M250 316 L207 322 M176 200 L176 316 M224 200 L224 316",
  shadows: "M143 210 C146 240 150 272 150 300 L158 300 C156 270 152 240 150 210 Z",
};

const denimCollar: GarmentShape = {
  d: "M180 152 C174 164 168 178 163 192 L180 185 L189 200 C187 182 185 166 180 152 Z M220 152 C226 164 232 178 237 192 L220 185 L211 200 C213 182 215 166 220 152 Z",
  seams: "M178 160 C174 170 170 180 167 188 M222 160 C226 170 230 180 233 188",
};

const blazerBody: GarmentShape = {
  d: jacketPanels(340, 198),
  seams: "M156 300 L178 298 M222 298 L244 300 M210 198 L226 196",
  folds: "M168 230 C172 260 174 290 176 330 M232 230 C228 260 226 290 224 330",
  shadows: "M143 210 C146 240 150 272 150 300 L158 300 C156 270 152 240 150 210 Z",
};

const blazerLapels: GarmentShape = {
  d: "M180 152 C182 182 188 214 197 252 L182 228 L168 210 L177 198 C175 182 176 166 180 152 Z M220 152 C218 182 212 214 203 252 L218 228 L232 210 L223 198 C225 182 224 166 220 152 Z",
  seams: "M181 162 C183 188 188 214 194 240 M219 162 C217 188 212 214 206 240",
  highlights: "M178 170 L176 196",
};

const cardiganBody: GarmentShape = {
  d: "M180 152 L152 159 C147 176 141 196 143 210 C146 240 150 272 150 300 C150 314 150 322 150 332 L201 336 L201 250 C193 220 186 186 180 152 Z M220 152 L248 159 C253 176 259 196 257 210 C254 240 250 272 250 300 C250 314 250 322 250 332 L201 336 L201 250 C207 220 214 186 220 152 Z",
  folds:
    "M156 324 L156 332 M162 324 L162 333 M168 325 L168 334 M174 325 L174 334 M180 326 L180 335 M186 326 L186 335 M192 326 L192 336 M208 326 L208 336 M214 326 L214 335 M220 326 L220 335 M226 325 L226 334 M232 325 L232 334 M238 324 L238 333 M244 324 L244 332",
  seams: "M150 322 L201 326 L250 322 M184 160 C190 192 196 222 201 248 C206 222 210 192 216 160",
  shadows: "M143 210 C146 240 150 272 150 300 L158 300 C156 270 152 240 150 210 Z",
};

const dungareeBib: GarmentShape = {
  d: "M170 214 L230 214 L234 282 L166 282 Z M172 216 L180 154 L189 154 L183 216 Z M228 216 L220 154 L211 154 L217 216 Z",
  seams: "M174 220 L226 220 M184 236 L216 236 L216 258 L184 258 Z M170 278 L230 278",
  shadows: "M166 282 L170 214 L176 214 L173 282 Z",
};

const outfits: Record<OutfitStyleId, OutfitDesign> = {
  "studio-apron": {
    fabrics: {
      top: cloth("apron-tee", "cotton", "ivory", "stripe"),
      outer: cloth("apron-sage", "linen", "sage", "solid"),
      bottom: cloth("apron-trousers", "linen", "navy", "solid"),
    },
    body: [
      { role: "bottom", shape: trousers },
      { role: "top", shape: teeBody },
      { role: "outer", shape: apron },
      { role: "outer", shape: apronTie },
    ],
    sleeves: [{ role: "top", shape: teeSleeve }],
  },
  "denim-jacket": {
    fabrics: {
      top: cloth("denim-tee", "cotton", "coral", "solid"),
      outer: cloth("denim-jacket", "denim", "navy", "solid"),
      bottom: cloth("denim-skirt", "denim", "black", "solid"),
    },
    body: [
      ...skirtShape("mini-skirt").map((shape) => ({ role: "bottom" as const, shape })),
      { role: "top", shape: teeBody },
      { role: "outer", shape: denimJacket },
      { role: "outer", shape: denimCollar },
    ],
    sleeves: [{ role: "outer", shape: longSleeve }],
    buttons: [
      { x: 176, y: 238, trim: "button", tint: "#c8964a" },
      { x: 224, y: 238, trim: "button", tint: "#c8964a" },
    ],
  },
  blazer: {
    fabrics: {
      top: cloth("blazer-shell", "silk", "ivory", "solid"),
      outer: cloth("blazer-wool", "wool", "plum", "solid"),
      bottom: cloth("blazer-trousers", "wool", "plum", "solid"),
    },
    body: [
      { role: "bottom", shape: trousers },
      { role: "top", shape: teeBody },
      { role: "outer", shape: blazerBody },
      { role: "outer", shape: blazerLapels },
    ],
    sleeves: [{ role: "outer", shape: longSleeve }],
    buttons: [{ x: 200, y: 272, trim: "button", tint: "#c9a227" }],
  },
  cardigan: {
    fabrics: {
      top: cloth("cardigan-top", "cotton", "navy", "stripe"),
      outer: cloth("cardigan-knit", "wool", "lavender", "solid"),
      bottom: cloth("cardigan-skirt", "linen", "sage", "solid"),
    },
    body: [
      ...skirtShape("a-line-skirt").map((shape) => ({ role: "bottom" as const, shape })),
      { role: "top", shape: teeBody },
      { role: "outer", shape: cardiganBody },
    ],
    sleeves: [{ role: "outer", shape: longSleeve }],
    buttons: [
      { x: 201, y: 262, trim: "pearl", tint: "#f6f0e6" },
      { x: 201, y: 284, trim: "pearl", tint: "#f6f0e6" },
      { x: 201, y: 306, trim: "pearl", tint: "#f6f0e6" },
    ],
  },
  dungarees: {
    fabrics: {
      top: cloth("dungaree-tee", "cotton", "mustard", "stripe"),
      outer: cloth("dungaree-denim", "denim", "sky", "solid"),
      bottom: cloth("dungaree-legs", "denim", "sky", "solid"),
    },
    body: [
      { role: "bottom", shape: trousers },
      { role: "top", shape: teeBody },
      { role: "outer", shape: dungareeBib },
    ],
    sleeves: [{ role: "top", shape: teeSleeve }],
    buttons: [
      { x: 178, y: 220, trim: "button", tint: "#c9a227" },
      { x: 222, y: 220, trim: "button", tint: "#c9a227" },
    ],
  },
};

const roles: readonly OutfitRole[] = ["top", "outer", "bottom"];

export interface AvatarOutfitProps {
  outfit: OutfitStyleId;
  idBase: string;
}

function patternId(idBase: string, role: OutfitRole): string {
  return `${idBase}-outfit-${role}`;
}

function Pieces({
  pieces,
  idBase,
  outfit,
  mirror,
}: AvatarOutfitProps & { pieces: OutfitPiece[]; mirror?: boolean }) {
  const design = outfits[outfit];
  return (
    <>
      {pieces.map((piece, index) => {
        const look = fabricLook(design.fabrics[piece.role]);
        return (
          <GarmentPiece
            key={index}
            shape={piece.shape}
            patternId={patternId(idBase, piece.role)}
            shadeId={`${idBase}-outfit-shade`}
            softId={`${idBase}-outfit-soft`}
            ink={darken(look.base, 0.55)}
            stitch={look.stitch}
            transform={mirror ? "matrix(-1 0 0 1 400 0)" : undefined}
          />
        );
      })}
    </>
  );
}

export function AvatarOutfitDefs({ outfit, idBase }: AvatarOutfitProps) {
  const design = outfits[outfit];
  return (
    <defs>
      <filter id={`${idBase}-outfit-soft`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.6" />
      </filter>
      <linearGradient id={`${idBase}-outfit-shade`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffffff" stopOpacity={0.14} />
        <stop offset="0.35" stopColor="#ffffff" stopOpacity={0} />
        <stop offset="1" stopColor="#1c1220" stopOpacity={0.26} />
      </linearGradient>
      {roles.map((role) => (
        <FabricPattern key={role} id={patternId(idBase, role)} fabric={design.fabrics[role]} tile={20} />
      ))}
    </defs>
  );
}

export function AvatarOutfitBody({ outfit, idBase }: AvatarOutfitProps) {
  const design = outfits[outfit];
  return (
    <g className="ad-outfit-body">
      <Pieces pieces={design.body} idBase={idBase} outfit={outfit} />
      {design.buttons?.map((button) => (
        <ButtonArt
          key={`${button.x}-${button.y}`}
          kind={button.trim}
          x={button.x}
          y={button.y}
          scale={button.trim === "pearl" ? 0.7 : 0.55}
          tint={button.tint}
        />
      ))}
    </g>
  );
}

export function AvatarOutfitSleeves({ outfit, idBase }: AvatarOutfitProps) {
  const design = outfits[outfit];
  return (
    <g className="ad-outfit-sleeves">
      <Pieces pieces={design.sleeves} idBase={idBase} outfit={outfit} />
      <Pieces pieces={design.sleeves} idBase={idBase} outfit={outfit} mirror />
    </g>
  );
}
