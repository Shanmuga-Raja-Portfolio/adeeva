import type { AvatarGarment } from "../../../../ui/art/avatar/Avatar";
import { darken } from "../../../../ui/art/colourMix";

const JACKET =
  "M180 150 L152 158 C146 176 140 198 143 214 C147 244 151 274 151 304 C151 318 149 330 148 342 Q200 352 252 342 C251 330 249 318 249 304 C249 274 253 244 257 214 C260 198 254 176 248 158 L220 150 C214 162 207 167 200 167 C193 167 186 162 180 150 Z";

const SLEEVE =
  "M157 159 C136 152 123 168 122 192 C121 230 118 270 116 300 C113 330 110 360 106 388 L123 392 C126 360 130 330 133 300 C136 270 140 240 147 212 Z";

const TROUSERS =
  "M162 330 Q200 336 238 330 C244 350 248 368 248 386 C248 480 246 600 245 712 L208 712 C206 600 204 480 201 400 L199 400 C196 480 194 600 192 712 L155 712 C154 600 152 480 152 386 C152 368 156 350 162 330 Z";

const COLLAR = "M178 150 L200 176 L222 150 L226 164 L200 190 L174 164 Z";

export function chefWhites(scarf: string): AvatarGarment {
  return {
    defs: (idBase) => (
      <linearGradient id={`${idBase}-whites`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.6" stopColor="#f3f0e8" />
        <stop offset="1" stopColor="#d9d6cc" />
      </linearGradient>
    ),
    body: (idBase) => (
      <g>
        <path d={TROUSERS} fill="#3a4448" stroke="#22292c" strokeWidth={2} />
        <path d="M176 340 L178 708 M224 340 L222 708" stroke="#2e3a40" strokeWidth={1.5} opacity={0.6} />
        <path d={JACKET} fill={`url(#${idBase}-whites)`} stroke="#b7b2a6" strokeWidth={2} />
        <path d="M200 180 C206 230 214 290 224 344" stroke="#c9c4b8" strokeWidth={2} fill="none" />
        {[208, 240, 272, 304].map((y) => (
          <g key={y}>
            <circle cx={186} cy={y} r={3.5} fill="#2e3a40" />
            <circle cx={222} cy={y + 2} r={3.5} fill="#2e3a40" />
          </g>
        ))}
        <path d={COLLAR} fill={scarf} stroke={darken(scarf, 0.3)} strokeWidth={1.5} />
        <path d="M200 176 L194 196 L200 204 L206 196 Z" fill={darken(scarf, 0.15)} />
      </g>
    ),
    sleeves: (idBase) => (
      <g>
        <path d={SLEEVE} fill={`url(#${idBase}-whites)`} stroke="#b7b2a6" strokeWidth={2} />
        <path
          d={SLEEVE}
          transform="matrix(-1 0 0 1 400 0)"
          fill={`url(#${idBase}-whites)`}
          stroke="#b7b2a6"
          strokeWidth={2}
        />
      </g>
    ),
  };
}
