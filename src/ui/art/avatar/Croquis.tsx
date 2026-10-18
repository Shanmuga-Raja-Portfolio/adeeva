import { darken, lighten, mixHex } from "../colourMix";
import { useSvgId } from "../useSvgId";
import { useArmSides } from "./armSide";

export const DOLL_WIDTH = 400;
export const DOLL_HEIGHT = 800;
export const DOLL_VIEWBOX = `0 0 ${DOLL_WIDTH} ${DOLL_HEIGHT}`;
export const DEFAULT_SKIN = "#c58c5c";

const torsoPath =
  "M189 136 C186 150 176 154 164 157 C150 160 140 163 136 172 C132 182 136 196 142 208 C146 226 152 242 160 256 C165 264 167 270 167 276 C167 290 156 306 152 328 C149 346 152 362 160 374 L200 388 L240 374 C248 362 251 346 248 328 C244 306 233 290 233 276 C233 270 235 264 240 256 C248 242 254 226 258 208 C264 196 268 182 264 172 C260 163 250 160 236 157 C224 154 214 150 211 136 Z";

const leftLegPath =
  "M156 336 C150 380 152 420 158 460 C162 490 164 510 163 530 C162 570 166 620 172 668 C174 690 174 704 173 716 L188 716 C188 700 188 688 190 670 C194 630 196 590 194 540 C194 510 196 480 198 450 C200 420 201 400 200 384 Z";

const leftShoePath =
  "M171 707 C177 711 185 711 190 707 C191 722 192 736 193 748 C194 761 190 769 182 769 L173 769 C165 769 161 761 163 750 C166 738 169 722 171 707 Z";

const leftAnklePath =
  "M171 707 C177 711 185 711 190 707 C191 722 192 734 193 746 L163 748 C166 736 169 722 171 707 Z";

const leftFlatPath =
  "M163 742 C170 738 186 738 193 742 C196 754 193 769 182 769 L173 769 C164 769 159 756 163 742 Z";

const leftSolePath =
  "M162 752 C160 764 165 773 173 773 L182 773 C191 773 196 764 194 752 C194 762 190 769 182 769 L173 769 C165 769 161 762 162 752 Z";

const leftArmPath =
  "M146 163 C132 164 124 176 123.5 194 C123 216 121.5 238 120.5 258 C119.5 272 118.5 284 118 293 C117.5 304 116 316 114.5 328 C112.5 348 110 368 108.5 388 C107.5 398 105.5 410 106 421 C106.5 431 109 439 113.5 441.5 C117 443 120.5 440.5 121.5 435 C122.5 428 122.5 420 122 412 C121.5 404 121 397 120.5 391 C122 372 126 350 130 330 C132.5 316 134 304 132.5 293 C133.5 276 137 254 141.5 234 C143.5 224 146 214 147 206 C148.5 190 150 172 146 163 Z";

const leftThumbPath =
  "M120.5 398 C124.5 401 126.5 409 125 417 C124.5 421 121.5 422.5 120 420 C120.5 413 120 406 118.5 401 Z";

const headPath =
  "M200 44 C220 44 231 60 231 80 C231 101 220 118 200 123 C180 118 169 101 169 80 C169 60 180 44 200 44 Z";

const mirror = "matrix(-1 0 0 1 400 0)";

export type CroquisShoes = "boots" | "flats";

export interface CroquisLayerProps {
  skinTone?: string | undefined;
}

export interface CroquisBodyProps extends CroquisLayerProps {
  head?: "croquis" | "none" | undefined;
  baseLayer?: boolean | undefined;
  shoes?: CroquisShoes | undefined;
}

function CroquisEye({ x, iris }: { x: number; iris: string }) {
  return (
    <g>
      <ellipse cx={x} cy={85} rx={6} ry={4.3} fill="#fffaf5" />
      <circle cx={x + 0.4} cy={85.4} r={3.3} fill={iris} />
      <circle cx={x + 0.4} cy={85.5} r={1.7} fill="#1c1220" />
      <circle cx={x + 1.5} cy={84.2} r={1.1} fill="#ffffff" />
      <path
        d={`M${x - 6.6} 84.6 Q${x} 79.4 ${x + 6.6} 84.6`}
        fill="none"
        stroke="#2b1d27"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </g>
  );
}

function FlatShoe({ id }: { id: string }) {
  return (
    <g>
      <path d={leftFlatPath} fill={`url(#${id}-flat)`} />
      <path d={leftSolePath} fill="#4a2a36" />
      <path d="M164 750 C172 747 184 747 192 749" stroke="#6a3448" strokeWidth={3} fill="none" />
      <circle cx={186} cy={748.4} r={1.8} fill="#f3d9a0" />
      <path
        d="M167 757 C168 751 171 747 176 746"
        stroke="#ffffff"
        strokeOpacity={0.35}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
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
  shoes = "boots",
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
        <linearGradient id={`${id}-flat`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c47b8d" />
          <stop offset="1" stopColor="#8a4760" />
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
          {shoes === "flats" ? (
            <g>
              <path d={leftAnklePath} fill={`url(#${id}-skin)`} />
              <FlatShoe id={id} />
            </g>
          ) : (
            <g>
              <path d={leftShoePath} fill={`url(#${id}-shoe)`} />
              <path d={leftSolePath} fill="#3a2531" />
              <path
                d="M172 709 C177 713 185 713 189 709"
                stroke="#2e1d28"
                strokeOpacity={0.55}
                strokeWidth={1.6}
                fill="none"
              />
              <path
                d="M168 754 C169 746 173 742 178 741"
                stroke="#ffffff"
                strokeOpacity={0.3}
                strokeWidth={1.6}
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}
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
          <CroquisEye x={187.5} iris={darken(skinTone, 0.62)} />
          <CroquisEye x={212.5} iris={darken(skinTone, 0.62)} />
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
  const sides = useArmSides();
  const line = darken(skinTone, 0.42);
  const shade = darken(skinTone, 0.22);
  return (
    <g className="ad-croquis-arms">
      <defs>
        <SkinGradient id={`${id}-skin`} skin={skinTone} />
      </defs>
      {sides.map((mirrored) => (
        <g key={String(mirrored)} transform={mirrored ? mirror : undefined}>
          <path
            d={leftArmPath}
            fill={`url(#${id}-skin)`}
            stroke={line}
            strokeWidth={1.1}
            strokeOpacity={0.5}
          />
          <path
            d="M128 186 C127 214 125 244 123.5 270 M121 312 C119 336 116 360 114 382"
            fill="none"
            stroke="#ffffff"
            strokeWidth={2.4}
            strokeLinecap="round"
            opacity={0.16}
          />
          <path
            d="M138 236 C135 256 133 274 132 290 M130 302 C127 326 124 352 121 378"
            fill="none"
            stroke={shade}
            strokeWidth={2.2}
            strokeLinecap="round"
            opacity={0.22}
          />
          <path
            d="M119.5 291 C122.5 295.5 127 297 131 295"
            fill="none"
            stroke={shade}
            strokeWidth={1.2}
            strokeLinecap="round"
            opacity={0.55}
          />
          <path
            d="M109 391 C112 393.5 116.5 394 120 392"
            fill="none"
            stroke={shade}
            strokeWidth={1}
            strokeLinecap="round"
            opacity={0.45}
          />
          <path
            d={leftThumbPath}
            fill={`url(#${id}-skin)`}
            stroke={line}
            strokeWidth={0.9}
            strokeOpacity={0.5}
          />
          <path
            d="M110.5 424 C111.5 430 112.5 435 114 439.5 M115.5 425 C116 431 117 435.5 118 439"
            fill="none"
            stroke={shade}
            strokeWidth={0.9}
            strokeLinecap="round"
            opacity={0.55}
          />
          <path
            d="M108.5 404 C108 412 108.5 420 110 427"
            fill="none"
            stroke="#ffffff"
            strokeWidth={1.4}
            strokeLinecap="round"
            opacity={0.2}
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
