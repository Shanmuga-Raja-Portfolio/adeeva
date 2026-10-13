import { PlacedLayer } from "../../../../ui/art/PlacedLayer";
import type { PlacedTopping } from "../../core";
import { ToppingArt } from "./ToppingArt";

export interface ToppingLayerProps {
  readonly toppings: readonly PlacedTopping[];
  readonly selectedId?: string | undefined;
}

export function ToppingLayer({ toppings, selectedId }: ToppingLayerProps) {
  return (
    <PlacedLayer
      items={toppings}
      className="pa-topping-layer"
      render={(topping) => (
        <ToppingArt
          toppingId={topping.toppingId}
          x={topping.x}
          y={topping.y}
          rotation={topping.rotation}
          scale={topping.scale}
          selected={topping.id === selectedId}
        />
      )}
    />
  );
}
