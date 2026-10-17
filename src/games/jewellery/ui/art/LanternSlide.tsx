import { useSvgId } from "../../../../ui/art/useSvgId";
import type { LookbookPage, PieceSource } from "../../core";
import { PhotoArt } from "./PhotoArt";

interface LanternSlideProps {
  readonly page: LookbookPage | undefined;
  readonly piece: PieceSource;
  readonly lantern: string;
  readonly glow: string;
  readonly shown: number;
}

const X = 450;
const Y = 150;
const SIZE = 300;

export function LanternSlide({ page, piece, lantern, glow, shown }: LanternSlideProps) {
  const id = useSvgId("jb-slide");
  if (shown <= 0) return null;
  return (
    <g opacity={shown} data-testid="lantern-slide">
      <defs>
        <clipPath id={`${id}-clip`}>
          <circle cx={X + SIZE / 2} cy={Y + SIZE / 2} r={SIZE / 2} />
        </clipPath>
        <radialGradient id={`${id}-edge`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.7" stopColor={glow} stopOpacity={0} />
          <stop offset="1" stopColor={glow} stopOpacity={0.6} />
        </radialGradient>
      </defs>
      <circle cx={X + SIZE / 2} cy={Y + SIZE / 2} r={SIZE / 2 + 16} fill={glow} opacity={0.25} />
      <g clipPath={`url(#${id}-clip)`}>
        {page === undefined ? (
          <rect x={X} y={Y} width={SIZE} height={SIZE} fill={lantern} />
        ) : (
          <g transform={`translate(${X} ${Y}) scale(${SIZE / 240})`}>
            <PhotoArt backdrop={page.backdrop} props={page.props} piece={piece} light={page.light ?? 0} />
          </g>
        )}
        <rect x={X} y={Y} width={SIZE} height={SIZE} fill={lantern} opacity={0.22} />
        <circle cx={X + SIZE / 2} cy={Y + SIZE / 2} r={SIZE / 2} fill={`url(#${id}-edge)`} />
      </g>
      <circle
        cx={X + SIZE / 2}
        cy={Y + SIZE / 2}
        r={SIZE / 2}
        fill="none"
        stroke="#2a1c30"
        strokeWidth={6}
        opacity={0.6}
      />
    </g>
  );
}
