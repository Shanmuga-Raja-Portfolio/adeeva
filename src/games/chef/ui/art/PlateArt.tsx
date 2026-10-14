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
  const component = componentById(placed.componentId);
  const [cx, cy] = placedCentre(placed);
  return (
    <g
      transform={`translate(${cx} ${cy}) rotate(${placed.rotation}) scale(${placed.scale}) translate(${-component.width / 2} ${-component.height / 2})`}
    >
      <ComponentArt componentId={placed.componentId} />
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
        <g fill="#c4502e" opacity={0.75}>
          <circle cx={PLATE_CENTRE + 150} cy={PLATE_CENTRE - 96} r={5} />
          <circle cx={PLATE_CENTRE + 160} cy={PLATE_CENTRE - 80} r={3} />
          <circle cx={PLATE_CENTRE - 166} cy={PLATE_CENTRE + 60} r={4} />
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
