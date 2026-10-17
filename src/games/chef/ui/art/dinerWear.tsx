import type { AvatarGarment } from "../../../../ui/art/avatar/Avatar";
import { darken, lighten } from "../../../../ui/art/colourMix";

const JUMPER =
  "M180 150 L150 160 C144 178 140 200 143 216 C147 246 150 276 150 306 C150 320 149 332 148 344 Q200 354 252 344 C251 332 250 320 250 306 C250 276 253 246 257 216 C260 200 256 178 250 160 L220 150 C214 160 207 164 200 164 C193 164 186 160 180 150 Z";

const SLEEVE =
  "M156 159 C135 152 122 168 121 192 C120 230 117 270 115 300 C112 330 109 360 105 388 L124 392 C127 360 131 330 134 300 C137 270 141 240 148 212 Z";

const TROUSERS =
  "M162 330 Q200 336 238 330 C244 350 248 368 248 386 C248 480 246 600 245 712 L208 712 C206 600 204 480 201 400 L199 400 C196 480 194 600 192 712 L155 712 C154 600 152 480 152 386 C152 368 156 350 162 330 Z";

export interface DinerStyle {
  readonly cloth: string;
  readonly trim: string;
  readonly collar: "crew" | "shirt" | "scarf";
}

export const DINER_STYLES: readonly DinerStyle[] = [
  { cloth: "#2f8c96", trim: "#f2e6c8", collar: "shirt" },
  { cloth: "#e0a33a", trim: "#7a3a1e", collar: "crew" },
  { cloth: "#d9573f", trim: "#fbe6c2", collar: "scarf" },
  { cloth: "#3f7a4a", trim: "#f6efe0", collar: "shirt" },
  { cloth: "#34508a", trim: "#f2c46b", collar: "scarf" },
  { cloth: "#c9667e", trim: "#fff3e6", collar: "crew" },
  { cloth: "#7a5232", trim: "#e9c58a", collar: "shirt" },
];

function Collar({ style }: { readonly style: DinerStyle }) {
  if (style.collar === "shirt")
    return (
      <g>
        <path d="M178 150 L200 178 L190 190 L172 162 Z" fill={style.trim} stroke={darken(style.trim, 0.3)} />
        <path d="M222 150 L200 178 L210 190 L228 162 Z" fill={style.trim} stroke={darken(style.trim, 0.3)} />
      </g>
    );
  if (style.collar === "scarf")
    return (
      <g>
        <path d="M176 152 Q200 176 224 152 L230 166 Q200 194 170 166 Z" fill={style.trim} />
        <path d="M206 176 L214 222 L200 226 L198 182 Z" fill={darken(style.trim, 0.12)} />
      </g>
    );
  return (
    <path d="M181 152 Q200 172 219 152" stroke={darken(style.cloth, 0.25)} strokeWidth={6} fill="none" />
  );
}

export function dinerWear(style: DinerStyle): AvatarGarment {
  return {
    defs: (idBase) => (
      <linearGradient id={`${idBase}-diner`} x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0" stopColor={lighten(style.cloth, 0.18)} />
        <stop offset="0.55" stopColor={style.cloth} />
        <stop offset="1" stopColor={darken(style.cloth, 0.22)} />
      </linearGradient>
    ),
    body: (idBase) => (
      <g>
        <path d={TROUSERS} fill="#3a3540" stroke="#221e26" strokeWidth={2} />
        <path d={JUMPER} fill={`url(#${idBase}-diner)`} stroke={darken(style.cloth, 0.35)} strokeWidth={2} />
        <path
          d="M160 230 C164 262 166 296 166 330 M240 230 C236 262 234 296 234 330"
          stroke={darken(style.cloth, 0.18)}
          strokeWidth={3}
          fill="none"
          opacity={0.6}
        />
        <path d="M150 334 Q200 344 250 334" stroke={darken(style.cloth, 0.3)} strokeWidth={5} fill="none" />
        <Collar style={style} />
      </g>
    ),
    sleeves: (idBase) => (
      <g>
        <path d={SLEEVE} fill={`url(#${idBase}-diner)`} stroke={darken(style.cloth, 0.35)} strokeWidth={2} />
        <path
          d={SLEEVE}
          transform="matrix(-1 0 0 1 400 0)"
          fill={`url(#${idBase}-diner)`}
          stroke={darken(style.cloth, 0.35)}
          strokeWidth={2}
        />
      </g>
    ),
  };
}
