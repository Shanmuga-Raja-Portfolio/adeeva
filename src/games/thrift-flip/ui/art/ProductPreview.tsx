import type { ReactNode, Ref } from "react";
import { PlacedLayer } from "../../../../ui/art/PlacedLayer";
import type { Cloth } from "../../../../ui/art/cloth/Cloth";
import { FabricPattern, fabricFill, fabricSheenFill } from "../../../../ui/art/cloth/FabricPattern";
import { fabricLook } from "../../../../ui/art/cloth/fabricLook";
import { useSvgId } from "../../../../ui/art/useSvgId";
import { FINISH_CANVAS, type Design, type PlacedFinish } from "../../core";
import { FinishArt } from "./FinishArt";
import { productShape, type Mount } from "./productShape";

export interface ProductPreviewProps {
  readonly design: Design;
  readonly cloth: Cloth | null;
  readonly finishes?: readonly PlacedFinish[] | undefined;
  readonly selectedId?: string | undefined;
  readonly title: string;
  readonly className?: string | undefined;
  readonly svgRef?: Ref<SVGSVGElement> | undefined;
  readonly children?: ReactNode;
}

function MountArt({ mount }: { readonly mount: Mount }) {
  switch (mount) {
    case "hanger":
      return (
        <g>
          <path
            d="M200 30 q14 0 14 12 q0 9 -14 14 v12"
            fill="none"
            stroke="#8a8f99"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <path
            d="M108 104 L200 68 L292 104"
            fill="none"
            stroke="#a07a52"
            strokeWidth={9}
            strokeLinecap="round"
          />
          <path
            d="M108 104 L200 68 L292 104"
            fill="none"
            stroke="#c99f72"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>
      );
    case "clip":
      return (
        <g>
          <path
            d="M200 26 q14 0 14 12 q0 9 -14 14 v14"
            fill="none"
            stroke="#8a8f99"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <rect x={120} y={64} width={160} height={10} rx={5} fill="#a07a52" />
          <rect x={140} y={70} width={16} height={34} rx={4} fill="#8a8f99" />
          <rect x={244} y={70} width={16} height={34} rx={4} fill="#8a8f99" />
        </g>
      );
    case "hook":
      return (
        <g>
          <rect x={60} y={40} width={280} height={12} rx={6} fill="#a07a52" />
          <path
            d="M200 52 v8 q0 12 -10 12"
            fill="none"
            stroke="#8a8f99"
            strokeWidth={5}
            strokeLinecap="round"
          />
        </g>
      );
    case "stand":
      return (
        <g>
          <ellipse cx={200} cy={360} rx={70} ry={12} fill="#2b2230" opacity={0.12} />
          <rect x={192} y={250} width={16} height={108} rx={6} fill="#a07a52" />
          <ellipse cx={200} cy={356} rx={56} ry={10} fill="#c99f72" stroke="#a07a52" strokeWidth={2} />
        </g>
      );
    case "stool":
      return (
        <g>
          <ellipse cx={200} cy={372} rx={130} ry={12} fill="#2b2230" opacity={0.12} />
          <rect
            x={84}
            y={318}
            width={232}
            height={22}
            rx={8}
            fill="#c99f72"
            stroke="#a07a52"
            strokeWidth={2}
          />
          <path
            d="M104 340 L96 370 M296 340 L304 370"
            stroke="#a07a52"
            strokeWidth={8}
            strokeLinecap="round"
          />
        </g>
      );
    case "peg":
      return (
        <g>
          <ellipse cx={200} cy={372} rx={84} ry={11} fill="#2b2230" opacity={0.12} />
          <rect x={192} y={110} width={16} height={258} rx={8} fill="#a07a52" />
          <ellipse cx={200} cy={366} rx={70} ry={10} fill="#c99f72" stroke="#a07a52" strokeWidth={2} />
        </g>
      );
  }
}

export function ProductPreview({
  design,
  cloth,
  finishes = [],
  selectedId,
  title,
  className,
  svgRef,
  children,
}: ProductPreviewProps) {
  const id = useSvgId("product");
  const shape = productShape(design);
  const look = cloth === null ? null : fabricLook(cloth);
  const fill = cloth === null ? "#efe4cf" : fabricFill(`${id}-fabric`);
  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={`0 0 ${FINISH_CANVAS} ${FINISH_CANVAS}`}
      role="img"
      aria-label={title}
    >
      <defs>
        {cloth !== null ? <FabricPattern id={`${id}-fabric`} fabric={cloth} tile={34} /> : null}
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#3b2a1c" floodOpacity="0.22" />
        </filter>
      </defs>
      {shape.mount === "stand" || shape.mount === "stool" || shape.mount === "peg" ? (
        <MountArt mount={shape.mount} />
      ) : null}
      <g filter={`url(#${id}-shadow)`}>
        {shape.bodies.map((body) => (
          <path
            key={body}
            d={body}
            fill={fill}
            fillRule="evenodd"
            stroke={look?.deep ?? "#c9b48c"}
            strokeWidth={2}
            strokeDasharray={cloth === null ? "8 6" : undefined}
          />
        ))}
      </g>
      {cloth !== null
        ? shape.bodies.map((body) => (
            <path key={`sheen-${body}`} d={body} fill={fabricSheenFill(`${id}-fabric`)} fillRule="evenodd" />
          ))
        : null}
      <g fill="none" stroke={look?.deep ?? "#b7a27c"} strokeWidth={6} opacity={0.18} strokeLinecap="round">
        {shape.shade.map((path) => (
          <path key={path} d={path} />
        ))}
      </g>
      <g fill="none" stroke={look?.stitch ?? "#8a7a64"} strokeWidth={1.8} strokeDasharray="6 4" opacity={0.8}>
        {shape.seams.map((path) => (
          <path key={path} d={path} />
        ))}
      </g>
      {shape.mount === "hanger" || shape.mount === "clip" || shape.mount === "hook" ? (
        <MountArt mount={shape.mount} />
      ) : null}
      <PlacedLayer
        items={finishes}
        className="tf-finish-layer"
        render={(finish) => <FinishArt {...finish} selected={finish.id === selectedId} />}
      />
      {children}
    </svg>
  );
}
