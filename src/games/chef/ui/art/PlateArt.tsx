import { darken, lighten } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { PlateColour } from "../../content/plateComponent";
import {
  componentById,
  PLATE_CENTRE,
  placedCentre,
  RIM_RADIUS,
  WELL_RADIUS,
  type PlacedComponent,
} from "../../core";
import { ComponentArt } from "./ComponentArt";

export const PLATE_HEX: Readonly<Record<PlateColour, string>> = {
  white: "#f7f4ee",
  slate: "#3c464c",
  sand: "#e3cfa7",
  "glaze-blue": "#5d86a8",
};

export const PLATE_NAMES: Readonly<Record<PlateColour, string>> = {
  white: "White",
  slate: "Slate",
  sand: "Sand",
  "glaze-blue": "Glaze blue",
};

export function PlacedPiece({ placed }: { readonly placed: PlacedComponent }) {
  const shade = useSvgId("ck-piece-shade");
  const component = componentById(placed.componentId);
  const [cx, cy] = placedCentre(placed);
  const { width, height } = component;
  return (
    <g>
      {component.role === "garnish" ? (
        <g transform={`translate(${cx + 3} ${cy + 6}) scale(${placed.scale})`}>
          <defs>
            <radialGradient id={shade}>
              <stop offset="0" stopColor="#3a2410" stopOpacity={0.42} />
              <stop offset="0.6" stopColor="#3a2410" stopOpacity={0.16} />
              <stop offset="1" stopColor="#3a2410" stopOpacity={0} />
            </radialGradient>
          </defs>
          <ellipse rx={width * 0.55} ry={height * 0.45} fill={`url(#${shade})`} />
        </g>
      ) : null}
      <g
        transform={`translate(${cx} ${cy}) rotate(${placed.rotation}) scale(${placed.scale}) translate(${-width / 2} ${-height / 2})`}
      >
        <ComponentArt componentId={placed.componentId} />
      </g>
    </g>
  );
}

export interface PlateDiscProps {
  readonly colour: PlateColour;
  readonly drips?: boolean | undefined;
  readonly showWell?: boolean | undefined;
}

export function PlateDisc({ colour, drips = false, showWell = false }: PlateDiscProps) {
  const id = useSvgId("ck-plate");
  const hex = PLATE_HEX[colour];
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-glaze`} cx="0.38" cy="0.32" r="0.8">
          <stop offset="0" stopColor={lighten(hex, 0.35)} />
          <stop offset="0.7" stopColor={hex} />
          <stop offset="1" stopColor={darken(hex, 0.12)} />
        </radialGradient>
      </defs>
      <ellipse
        cx={PLATE_CENTRE + 6}
        cy={PLATE_CENTRE + 12}
        rx={RIM_RADIUS}
        ry={RIM_RADIUS}
        fill="#0d1215"
        opacity={0.28}
      />
      <circle cx={PLATE_CENTRE} cy={PLATE_CENTRE} r={RIM_RADIUS} fill={`url(#${id}-glaze)`} />
      <circle
        cx={PLATE_CENTRE}
        cy={PLATE_CENTRE}
        r={RIM_RADIUS - 2}
        fill="none"
        stroke={lighten(hex, 0.5)}
        strokeOpacity={0.6}
        strokeWidth={2}
      />
      <circle cx={PLATE_CENTRE} cy={PLATE_CENTRE} r={WELL_RADIUS} fill={darken(hex, 0.05)} />
      <circle
        cx={PLATE_CENTRE}
        cy={PLATE_CENTRE}
        r={WELL_RADIUS}
        fill="none"
        stroke={darken(hex, 0.16)}
        strokeWidth={2}
      />
      {showWell ? (
        <circle
          cx={PLATE_CENTRE}
          cy={PLATE_CENTRE}
          r={WELL_RADIUS}
          fill="none"
          stroke="#f2a93b"
          strokeWidth={2}
          strokeDasharray="6 8"
          opacity={0.75}
        />
      ) : null}
      <path
        d={`M${PLATE_CENTRE - 120} ${PLATE_CENTRE - 135} A ${RIM_RADIUS - 8} ${RIM_RADIUS - 8} 0 0 1 ${PLATE_CENTRE + 40} ${PLATE_CENTRE - 178}`}
        stroke="#ffffff"
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.35}
        fill="none"
      />
      {drips ? (
        <g>
          {[
            [PLATE_CENTRE + 156, PLATE_CENTRE - 104, 32],
            [PLATE_CENTRE - 164, PLATE_CENTRE + 58, 20],
          ].map(([x = 0, y = 0, r = 0]) => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r={r}
              fill="#fff3d6"
              fillOpacity={0.35}
              stroke="#f2a93b"
              strokeWidth={2.5}
              strokeDasharray="5 5"
            />
          ))}
          <g transform={`translate(${PLATE_CENTRE + 146} ${PLATE_CENTRE - 98}) rotate(-30)`}>
            <path
              d="M-14 0 C-14 -6 -4 -8 6 -7 C16 -6 20 0 14 4 C6 8 -14 6 -14 0 Z"
              fill="#c4502e"
              opacity={0.8}
            />
            <ellipse cx={-2} cy={-3} rx={6} ry={1.6} fill="#ffffff" opacity={0.45} />
            <circle cx={24} cy={2} r={3} fill="#c4502e" opacity={0.75} />
          </g>
          <g transform={`translate(${PLATE_CENTRE - 164} ${PLATE_CENTRE + 58}) rotate(70)`}>
            <path
              d="M-10 0 C-10 -5 -2 -6 5 -5 C12 -4 14 0 10 3 C4 6 -10 5 -10 0 Z"
              fill="#c4502e"
              opacity={0.8}
            />
            <ellipse cx={-1} cy={-2} rx={4} ry={1.2} fill="#ffffff" opacity={0.45} />
          </g>
        </g>
      ) : null}
    </g>
  );
}

export interface PlateGroupProps {
  readonly colour: PlateColour;
  readonly components: readonly PlacedComponent[];
  readonly transform?: string | undefined;
}

export function PlateGroup({ colour, components, transform }: PlateGroupProps) {
  const ordered = [...components].sort((a, b) => a.layer - b.layer);
  return (
    <g transform={transform}>
      <PlateDisc colour={colour} />
      {ordered.map((placed) => (
        <PlacedPiece key={placed.componentId} placed={placed} />
      ))}
    </g>
  );
}

export interface PlateArtProps {
  readonly colour: PlateColour;
  readonly components: readonly PlacedComponent[];
  readonly title: string | null;
  readonly className?: string | undefined;
}

export function PlateArt({ colour, components, title, className }: PlateArtProps) {
  return (
    <svg
      viewBox="-12 -12 424 424"
      className={className}
      role={title === null ? undefined : "img"}
      aria-label={title ?? undefined}
      aria-hidden={title === null ? true : undefined}
    >
      <PlateGroup colour={colour} components={components} />
    </svg>
  );
}
