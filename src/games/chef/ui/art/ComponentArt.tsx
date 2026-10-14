import type { ComponentType } from "react";
import { seedFromText } from "../../../../ui/art/seedFromText";
import type { ComponentArt as ArtKind, ComponentId } from "../../content/plateComponent";
import { componentById } from "../../core";
import { GARNISH_ARTS } from "./garnishArt";
import { HERO_ARTS, type PieceArtProps } from "./heroArt";

const ARTS: Readonly<Record<ArtKind, ComponentType<PieceArtProps>>> = { ...HERO_ARTS, ...GARNISH_ARTS };

export interface ComponentArtProps {
  readonly componentId: ComponentId;
}

export function ComponentArt({ componentId }: ComponentArtProps) {
  const component = componentById(componentId);
  const Art = ARTS[component.art];
  return (
    <Art
      w={component.width}
      h={component.height}
      c1={component.colour}
      c2={component.colour2}
      seed={seedFromText(component.id)}
    />
  );
}
