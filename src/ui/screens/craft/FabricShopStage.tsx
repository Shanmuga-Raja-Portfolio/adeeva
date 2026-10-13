import { FabricShop } from "./FabricShop";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";

export function FabricShopStage(props: StageProps) {
  const open = props.state.calendar.shopOpen;
  return (
    <div className="ad-shop-stage">
      <FabricShop {...props} />
      <StageFooter
        {...props}
        before={open ? [{ type: "closeShop" }] : []}
        hint={
          open ? "Done shopping? We will close the shop door behind you." : "Your fabric is on the shelf."
        }
      />
    </div>
  );
}
