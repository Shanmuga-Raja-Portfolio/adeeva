import { darken, lighten, mixHex } from "./colourMix";
import { useSvgId } from "./useSvgId";

export const DOLL_WIDTH = 400;
export const DOLL_HEIGHT = 800;
export const DOLL_VIEWBOX = `0 0 ${DOLL_WIDTH} ${DOLL_HEIGHT}`;
export const DEFAULT_SKIN = "#c58c5c";

const torsoPath =
  "M189 136 C186 150 176 154 164 157 C150 160 140 163 136 172 C132 182 136 196 142 208 C146 226 152 242 160 256 C165 264 167 270 167 276 C167 290 156 306 152 328 C149 346 152 362 160 374 L200 388 L240 374 C248 362 251 346 248 328 C244 306 233 290 233 276 C233 270 235 264 240 256 C248 242 254 226 258 208 C264 196 268 182 264 172 C260 163 250 160 236 157 C224 154 214 150 211 136 Z";

const leftLegPath =
  "M156 336 C150 380 152 420 158 460 C162 490 164 510 163 530 C162 570 166 620 172 668 C174 690 174 704 173 716 L188 716 C188 700 188 688 190 670 C194 630 196 590 194 540 C194 510 196 480 198 450 C200 420 201 400 200 384 Z";

const leftShoePath =
  "M171 710 L189 710 C191 728 187 748 181 766 C178 771 173 770 172 765 C169 748 168 728 171 710 Z";

const leftArmPath =
  "M141 165 C128 171 124 190 124 210 C123 240 120 266 118 290 C116 322 110 358 107 390 C105 400 102 412 104 423 C105 432 110 438 114 436 C118 434 120 425 120 415 C121 406 121 398 121 392 C124 360 130 326 133 294 C135 266 140 240 142 214 Z";

const headPath =
  "M200 44 C220 44 231 60 231 80 C231 101 220 118 200 123 C180 118 169 101 169 80 C169 60 180 44 200 44 Z";

const mirror = "matrix(-1 0 0 1 400 0)";

export interface CroquisLayerProps {
  skinTone?: string | undefined;
}

export interface CroquisBodyProps extends CroquisLayerProps {
  head?: "croquis" | "none" | undefined;
  baseLayer?: boolean | undefined;
}

function SkinGradient({ id, skin }: { id: string; skin: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor={lighten(skin, 0.12)} />
      <stop offset="0.45" stopColor={skin} />
      <stop offset="1" stopColor={darken(skin, 0.16)} />
    </linearGradient>
  );
}

export function CroquisBody({
  skinTone = DEFAULT_SKIN,
  head = "croquis",
  baseLayer = true,
}: CroquisBodyProps) {
  const id = useSvgId("croquis");
  const line = darken(skinTone, 0.42);
  const shade = darken(skinTone, 0.22);
  const hair = "#3a2730";
  const base = "#ece2e6";
  return (
    <g className="ad-croquis-body">
      <defs>
        <SkinGradient id={`${id}-skin`} skin={skinTone} />
        <linearGradient id={`${id}-base`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f7f1f3" />
          <stop offset="0.5" stopColor={base} />
          <stop offset="1" stopColor="#d6c8cf" />
        </linearGradient>
        <linearGradient id={`${id}-shoe`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a5f74" />
          <stop offset="1" stopColor="#4b3141" />
        </linearGradient>
      </defs>
      <ellipse cx={200} cy={774} rx={70} ry={9} fill="#2b2230" opacity={0.1} />
      {[false, true].map((mirrored) => (
        <g key={String(mirrored)} transform={mirrored ? mirror : undefined}>
          <path
            d={leftLegPath}
            fill={`url(#${id}-skin)`}
            stroke={line}
            strokeWidth={1.1}
            strokeOpacity={0.5}
          />
          <path
            d="M170 520 C172 528 176 532 182 532"
            fill="none"
            stroke={shade}
            strokeWidth={1.2}
            opacity={0.5}
          />
          <path d={leftShoePath} fill={`url(#${id}-shoe)`} />
          <path
            d="M175 716 C174 732 175 748 177 760"
            stroke="#ffffff"
            strokeOpacity={0.25}
            strokeWidth={1.4}
            fill="none"
          />
        </g>
      ))}
      <path d={torsoPath} fill={`url(#${id}-skin)`} stroke={line} strokeWidth={1.1} strokeOpacity={0.5} />
      <path
        d="M178 162 C186 166 194 166 199 163 M222 162 C214 166 206 166 201 163"
        fill="none"
        stroke={shade}
        strokeWidth={1.2}
        opacity={0.55}
      />
      {baseLayer ? (
        <g>
          <path
            d="M146 216 C156 208 174 207 186 215 Q200 230 214 215 C226 207 244 208 254 216 C250 232 244 248 239 258 C234 266 232 272 232 280 C232 294 242 308 246 326 C247 334 247 340 246 344 C232 350 212 366 200 386 C188 366 168 350 154 344 C153 340 153 334 154 326 C158 308 168 294 168 280 C168 272 166 266 161 258 C156 248 150 232 146 212 Z"
            fill={`url(#${id}-base)`}
            stroke="#9c8a94"
            strokeWidth={1}
            strokeOpacity={0.6}
          />
          <path
            d="M170 226 Q182 236 194 228 M206 228 Q218 236 230 226"
            fill="none"
            stroke="#9c8a94"
            strokeWidth={1}
            opacity={0.45}
          />
        </g>
      ) : null}
      <path d="M189 112 L188 150 Q200 156 212 150 L211 112 Z" fill={`url(#${id}-skin)`} />
      <path d="M189 120 Q200 132 211 120 L211 128 Q200 138 189 128 Z" fill={shade} opacity={0.35} />
      {head === "croquis" ? (
        <g>
          <circle cx={200} cy={34} r={15} fill={hair} />
          <path
            d="M193 24 C198 20 206 22 209 28"
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.18}
            strokeWidth={2}
          />
          <path d={headPath} fill={`url(#${id}-skin)`} stroke={line} strokeWidth={1.1} strokeOpacity={0.5} />
          <path
            d="M168 84 C164 54 182 40 200 40 C218 40 236 54 232 84 C228 68 220 58 204 56 C200 62 192 64 186 62 C178 66 172 74 168 84 Z"
            fill={hair}
          />
          <path
            d="M200 42 C214 42 226 52 228 66"
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.16}
            strokeWidth={2.4}
          />
          <path
            d="M181 85 Q187 89 194 85 M206 85 Q213 89 219 85"
            fill="none"
            stroke="#3a2730"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <path
            d="M180 77 Q187 73 194 76 M206 76 Q213 73 220 77"
            fill="none"
            stroke={hair}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.8}
          />
          <path
            d="M200 88 Q198 96 201 99"
            fill="none"
            stroke={shade}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
          <path d="M193 106 Q200 103 207 106 Q200 112 193 106 Z" fill={mixHex("#c2506f", skinTone, 0.35)} />
          <ellipse cx={183} cy={97} rx={6} ry={3.5} fill="#e88a9a" opacity={0.25} />
          <ellipse cx={217} cy={97} rx={6} ry={3.5} fill="#e88a9a" opacity={0.25} />
        </g>
      ) : null}
    </g>
  );
}

export function CroquisArms({ skinTone = DEFAULT_SKIN }: CroquisLayerProps) {
  const id = useSvgId("arms");
  const line = darken(skinTone, 0.42);
  const shade = darken(skinTone, 0.22);
  return (
    <g className="ad-croquis-arms">
      <defs>
        <SkinGradient id={`${id}-skin`} skin={skinTone} />
      </defs>
      {[false, true].map((mirrored) => (
        <g key={String(mirrored)} transform={mirrored ? mirror : undefined}>
          <path
            d={leftArmPath}
            fill={`url(#${id}-skin)`}
            stroke={line}
            strokeWidth={1.1}
            strokeOpacity={0.5}
          />
          <path
            d="M120 290 C122 294 126 296 130 295"
            fill="none"
            stroke={shade}
            strokeWidth={1.1}
            opacity={0.5}
          />
          <path
            d="M118 410 C116 418 116 424 118 428"
            fill="none"
            stroke={shade}
            strokeWidth={1}
            opacity={0.6}
          />
        </g>
      ))}
    </g>
  );
}

export interface CroquisProps extends CroquisBodyProps {
  title?: string | undefined;
  className?: string | undefined;
}

export function Croquis({ title = "Fashion croquis figure", className, ...body }: CroquisProps) {
  return (
    <svg className={className} viewBox={DOLL_VIEWBOX} role="img" aria-label={title}>
      <CroquisBody {...body} />
      <CroquisArms skinTone={body.skinTone} />
    </svg>
  );
}
