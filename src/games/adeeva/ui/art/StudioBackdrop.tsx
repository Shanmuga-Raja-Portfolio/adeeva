import { AtelierStudio } from "./AtelierStudio";
import { BedroomStudio } from "./BedroomStudio";
import { useSvgId } from "../../../../ui/art/useSvgId";

export type StudioKind = "bedroom" | "atelier";

export interface StudioBackdropProps {
  kind: StudioKind;
  wash?: number | undefined;
  className?: string | undefined;
}

export function StudioBackdrop({ kind, wash = 0.28, className }: StudioBackdropProps) {
  const idBase = useSvgId("studio");
  return (
    <svg
      className={className ? `ad-studio-backdrop ${className}` : "ad-studio-backdrop"}
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {kind === "bedroom" ? <BedroomStudio idBase={idBase} /> : <AtelierStudio idBase={idBase} />}
      <rect width={1600} height={900} fill="#fbf6ef" opacity={wash} />
    </svg>
  );
}
