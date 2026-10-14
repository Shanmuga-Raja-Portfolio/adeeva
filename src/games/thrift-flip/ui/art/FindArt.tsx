import { FabricPattern, fabricFill, fabricSheenFill } from "../../../../ui/art/cloth/FabricPattern";
import { fabricLook } from "../../../../ui/art/cloth/fabricLook";
import { darken } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { ConditionGrade } from "../../content/condition";
import type { FindDef, FindShape } from "../../content/find";
import { findCloth } from "./findCloth";

export interface FindArtProps {
  readonly find: FindDef;
  readonly grade?: ConditionGrade | undefined;
  readonly size?: number | undefined;
  readonly className?: string | undefined;
  readonly title?: string | undefined;
  readonly mended?: boolean | undefined;
}

const OUTLINES: Readonly<Record<FindShape, string>> = {
  jeans: "M30 34 L90 34 L92 46 L97 140 L68 140 L61 72 L59 72 L52 140 L23 140 L28 46 Z",
  shirt: "M42 30 L52 26 Q60 34 68 26 L78 30 L104 46 L97 68 L86 61 L86 134 L34 134 L34 61 L23 68 L16 46 Z",
  dress: "M46 28 L54 25 Q60 32 66 25 L74 28 L79 62 L104 138 Q60 146 16 138 L41 62 Z",
  cloth: "M24 30 L96 30 L98 112 L94 128 L26 128 L22 112 Z",
  coat: "M40 30 L50 26 L60 52 L70 26 L80 30 L106 44 L104 122 L92 122 L88 64 L88 140 L32 140 L32 64 L28 122 L16 122 L14 44 Z",
  skirt: "M38 32 L82 32 L84 42 L101 124 Q80 132 60 126 Q40 132 19 124 L36 42 Z",
};

function details(shape: FindShape, stitch: string, deep: string) {
  switch (shape) {
    case "jeans":
      return (
        <g fill="none" stroke={stitch} strokeWidth={1.1} strokeDasharray="2.4 2">
          <path d="M28 46 L92 46" />
          <path d="M36 50 Q42 60 52 52" />
          <path d="M84 50 Q78 60 68 52" />
          <path d="M60 46 L60 70" />
          <path d="M30 128 L52 128 M68 128 L95 128" />
        </g>
      );
    case "shirt":
      return (
        <g>
          <path d="M52 26 L60 40 L68 26 L64 36 L60 34 L56 36 Z" fill={deep} opacity={0.35} />
          <path d="M60 40 L60 134" stroke={stitch} strokeWidth={1.1} strokeDasharray="2.4 2" />
          {[52, 70, 88, 106, 124].map((y) => (
            <circle key={y} cx={63.5} cy={y} r={2} fill="#f4ecd8" stroke={deep} strokeWidth={0.6} />
          ))}
          <path d="M86 61 L86 72 M34 61 L34 72" stroke={deep} strokeWidth={1} opacity={0.4} />
        </g>
      );
    case "dress":
      return (
        <g fill="none" stroke={stitch} strokeWidth={1.1} strokeDasharray="2.4 2">
          <path d="M41 62 Q60 68 79 62" />
          <path d="M22 132 Q60 140 98 132" />
          <path d="M54 25 Q60 38 66 25" />
        </g>
      );
    case "cloth":
      return (
        <g>
          <path d="M24 44 Q60 52 96 44" fill="none" stroke={deep} strokeWidth={1.2} opacity={0.35} />
          <path d="M23 88 Q60 96 97 88" fill="none" stroke={deep} strokeWidth={1.2} opacity={0.3} />
          <path d="M28 120 L92 120" stroke={stitch} strokeWidth={1.1} strokeDasharray="2.4 2" />
          {[30, 38, 46, 54, 62, 70, 78, 86].map((x) => (
            <path key={x} d={`M${x} 128 l0 7`} stroke={deep} strokeWidth={1.4} strokeLinecap="round" />
          ))}
        </g>
      );
    case "coat":
      return (
        <g>
          <path d="M50 26 L60 52 L54 74 L44 40 Z M70 26 L60 52 L66 74 L76 40 Z" fill={deep} opacity={0.3} />
          {[86, 104].map((y) => (
            <circle key={y} cx={64} cy={y} r={2.6} fill="#e8d9bd" stroke={deep} strokeWidth={0.7} />
          ))}
          <path
            d="M38 104 L52 104 M68 112 L82 112"
            stroke={stitch}
            strokeWidth={1.1}
            strokeDasharray="2.4 2"
          />
        </g>
      );
    case "skirt":
      return (
        <g fill="none" stroke={stitch} strokeWidth={1.1} strokeDasharray="2.4 2">
          <path d="M36 42 L84 42" />
          <path d="M48 44 L42 120 M60 44 L60 124 M72 44 L78 120" opacity={0.6} />
        </g>
      );
  }
}

export function FindArt({
  find,
  grade = "like-new",
  size = 120,
  className,
  title,
  mended = false,
}: FindArtProps) {
  const id = useSvgId("find");
  const cloth = findCloth(find);
  const look = fabricLook(cloth);
  const outline = OUTLINES[find.shape];
  return (
    <svg
      className={className}
      viewBox="0 0 120 150"
      width={size}
      height={(size * 150) / 120}
      role="img"
      aria-label={title ?? find.name}
    >
      <defs>
        <FabricPattern id={`${id}-fabric`} fabric={cloth} tile={18} />
        <clipPath id={`${id}-clip`}>
          <path d={outline} />
        </clipPath>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.4" floodColor="#3b2a1c" floodOpacity="0.25" />
        </filter>
      </defs>
      <path
        d="M60 3 q8 0 8 7 q0 5 -8 8 v6"
        fill="none"
        stroke="#8a8f99"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <g filter={`url(#${id}-shadow)`}>
        <path d={outline} fill={fabricFill(`${id}-fabric`)} stroke={look.deep} strokeWidth={1.2} />
      </g>
      <g clipPath={`url(#${id}-clip)`}>
        <path d={outline} fill={fabricSheenFill(`${id}-fabric`)} />
        {details(find.shape, look.stitch, darken(look.base, 0.4))}
        {grade === "tired" ? (
          <rect x={0} y={0} width={120} height={150} fill="#f5ecd8" opacity={0.28} />
        ) : null}
        {grade !== "like-new" ? (
          <ellipse
            cx={46}
            cy={96}
            rx={9}
            ry={6.5}
            fill="#7a5a36"
            opacity={0.28}
            transform="rotate(-18 46 96)"
          />
        ) : null}
        {grade === "tired" ? (
          <g>
            <ellipse cx={76} cy={74} rx={6} ry={4.5} fill="#7a5a36" opacity={0.24} />
            <circle
              cx={68}
              cy={112}
              r={7}
              fill="none"
              stroke={darken(look.base, 0.3)}
              strokeWidth={1.4}
              strokeDasharray="1.6 1.6"
            />
            <path
              d="M64 108 l8 8 M72 108 l-8 8"
              stroke={darken(look.base, 0.35)}
              strokeWidth={0.9}
              opacity={0.6}
            />
          </g>
        ) : null}
      </g>
      <path d="M20 30 L60 17 L100 30" fill="none" stroke="#a07a52" strokeWidth={4} strokeLinecap="round" />
      <path d="M20 30 L60 17 L100 30" fill="none" stroke="#c99f72" strokeWidth={1.4} strokeLinecap="round" />
      {mended ? (
        <g className="tf-find-mend">
          <path
            d="M44 84 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6"
            fill="none"
            stroke="#f08a3c"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M44 92 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6"
            fill="none"
            stroke="#fff4e2"
            strokeWidth={1.1}
            strokeDasharray="2 2"
          />
          <path
            d="M78 106 c-3 -5 -10 -2 -8 3 c1 3 8 7 8 7 c0 0 7 -4 8 -7 c2 -5 -5 -8 -8 -3 Z"
            fill="#e57a8f"
          />
        </g>
      ) : null}
      {grade === "like-new" ? (
        <g fill="#fff8d6" className="tf-find-glint">
          <path d="M98 50 l1.6 4 l4 1.6 l-4 1.6 l-1.6 4 l-1.6 -4 l-4 -1.6 l4 -1.6 Z" />
          <path d="M22 96 l1.2 3 l3 1.2 l-3 1.2 l-1.2 3 l-1.2 -3 l-3 -1.2 l3 -1.2 Z" />
        </g>
      ) : null}
    </svg>
  );
}
