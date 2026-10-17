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
  readonly dripColour?: string | undefined;
  readonly showWell?: boolean | undefined;
}

const DRIPS: readonly (readonly [number, number, number, number])[] = [
  [PLATE_CENTRE + 132, PLATE_CENTRE - 104, 40, 1],
  [PLATE_CENTRE - 142, PLATE_CENTRE + 80, -130, 0.8],
];

export function PlateDisc({
  colour,
  drips = false,
  dripColour = "#c4502e",
  showWell = false,
}: PlateDiscProps) {
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
        <radialGradient id={`${id}-well`} cx="0.42" cy="0.36" r="0.7">
          <stop offset="0" stopColor={lighten(hex, 0.2)} />
          <stop offset="0.75" stopColor={darken(hex, 0.04)} />
          <stop offset="1" stopColor={darken(hex, 0.14)} />
        </radialGradient>
        <filter id={`${id}-speckle`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={5} />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.26  0 0 0 0 0.2  0 0 0 0.6 -0.22" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
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
      <circle
        cx={PLATE_CENTRE}
        cy={PLATE_CENTRE}
        r={RIM_RADIUS}
        fill="#ffffff"
        filter={`url(#${id}-speckle)`}
        opacity={0.5}
      />
      <circle
        cx={PLATE_CENTRE}
        cy={PLATE_CENTRE}
        r={WELL_RADIUS + 6}
        fill="none"
        stroke={darken(hex, 0.1)}
        strokeOpacity={0.35}
        strokeWidth={6}
      />
      <circle cx={PLATE_CENTRE} cy={PLATE_CENTRE} r={WELL_RADIUS} fill={`url(#${id}-well)`} />
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
          {DRIPS.map(([x, y, turn, size]) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${turn}) scale(${size})`}>
              <path
                d="M-20 -2 C-16 -9 -4 -7 4 -9 C14 -11 24 -6 22 1 C20 7 10 5 2 8 C-8 11 -22 7 -20 -2 Z"
                fill={darken(dripColour, 0.45)}
                opacity={0.18}
                transform="translate(2 3)"
              />
              <path
                d="M-20 -2 C-16 -9 -4 -7 4 -9 C14 -11 24 -6 22 1 C20 7 10 5 2 8 C-8 11 -22 7 -20 -2 Z"
                fill={darken(dripColour, 0.12)}
              />
              <path
                d="M-20 -2 C-16 -9 -4 -7 4 -9 C14 -11 24 -6 22 1 C20 7 10 5 2 8 C-8 11 -22 7 -20 -2 Z"
                fill={lighten(dripColour, 0.2)}
                transform="translate(-2 -1.5) scale(0.7)"
                opacity={0.6}
              />
              <ellipse cx={-6} cy={-4} rx={6} ry={2} fill="#ffffff" opacity={0.65} />
              <circle cx={30} cy={-2} r={3.2} fill={dripColour} opacity={0.85} />
              <circle cx={36} cy={4} r={1.8} fill={dripColour} opacity={0.75} />
              <circle cx={-30} cy={5} r={2.2} fill={dripColour} opacity={0.75} />
            </g>
          ))}
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
