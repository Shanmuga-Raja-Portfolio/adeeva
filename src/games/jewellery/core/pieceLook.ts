import type { PlacedPose } from "../../../engine/placedPose";
import type { ChainId, CharmId } from "../content/extra";
import type { FinishId } from "../content/finish";
import type { GlazeColour } from "../content/jewelColour";
import type { MetalId } from "../content/metal";
import type { OptionId, OptionSlot } from "../content/partOption";
import type { ProductId } from "../content/product";
import type { StoneId } from "../content/stone";

export interface PlacedCharm extends PlacedPose {
  readonly id: string;
  readonly charmId: CharmId;
}

export type DesignOptions = Readonly<Partial<Record<OptionSlot, OptionId>>>;

export interface PieceLook {
  readonly productId: ProductId;
  readonly options: DesignOptions;
  readonly metalId: MetalId;
  readonly stoneId: StoneId | null;
  readonly finish: FinishId;
  readonly glaze: GlazeColour | null;
  readonly chain: ChainId | null;
  readonly cordColour: GlazeColour | null;
  readonly charms: readonly PlacedCharm[];
}
