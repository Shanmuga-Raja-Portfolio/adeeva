import type { FabricDef } from "../../../content/fabric";
import {
  fabricCost,
  fabricPurchaseIssues,
  fabricUnitPrice,
  isFabricUnlocked,
  materialById,
  MAX_FABRIC_PURCHASE_METRES,
  METRE_STEP,
  type Action,
  type GameState,
} from "../../../core";
import { FabricSwatch } from "../../art/FabricSwatch";
import { Button } from "../../../../../ui/kit/Button";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { QuantityStepper } from "./QuantityStepper";

export interface ShopFabricCardProps {
  readonly state: GameState;
  readonly fabric: FabricDef;
  readonly neededMetres: number | null;
  readonly metres: number;
  readonly onMetres: (metres: number) => void;
  readonly dispatch: (action: Action) => boolean;
}

function formatPrice(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function ShopFabricCard({
  state,
  fabric,
  neededMetres,
  metres,
  onMetres,
  dispatch,
}: ShopFabricCardProps) {
  const once = useDispatchOnce(state, dispatch);
  const owned = state.inventory.fabricMetres[fabric.id] ?? 0;
  const unlocked = isFabricUnlocked(state, fabric);
  const issues = fabricPurchaseIssues(state, fabric.id, metres);
  const unit = fabricUnitPrice(state, fabric);
  const discounted = unit < fabric.pricePerMetre;
  const short = neededMetres !== null ? Math.max(0, neededMetres - owned) : 0;
  return (
    <li
      className={[
        "ad-shop-card",
        neededMetres !== null ? "ad-shop-card--wanted" : "",
        unlocked ? "" : "ad-shop-card--locked",
      ].join(" ")}
      data-fabric={fabric.id}
    >
      <div className="ad-shop-card__swatch">
        <FabricSwatch fabric={fabric} size={84} locked={!unlocked} />
        {neededMetres !== null ? <span className="ad-shop-card__flag">In your design</span> : null}
      </div>
      <div className="ad-shop-card__info">
        <strong className="ad-shop-card__name">{fabric.name}</strong>
        <span className="ad-shop-card__meta">
          {materialById(fabric.material).name} · {fabric.print} · {fabric.tags.join(", ")}
        </span>
        <span className="ad-shop-card__price">
          {discounted ? <s>{fabric.pricePerMetre}</s> : null} {formatPrice(unit)} coins / m
        </span>
        <span className="ad-shop-card__owned">
          {owned > 0 ? `You own ${owned} m` : "None on your shelf"}
          {neededMetres !== null ? ` · design needs about ${neededMetres} m` : ""}
        </span>
      </div>
      {unlocked ? (
        <div className="ad-shop-card__buy">
          <QuantityStepper
            label="Metres"
            value={metres}
            step={METRE_STEP}
            min={METRE_STEP}
            max={MAX_FABRIC_PURCHASE_METRES}
            unit="m"
            onChange={onMetres}
          />
          <Button
            variant={short > 0 ? "primary" : "secondary"}
            onClick={(event) => once(event, { type: "buyFabric", fabricId: fabric.id, metres })}
            disabledReason={issues[0]}
            showReason={state.calendar.shopOpen}
            aria-label={`Buy ${metres} metres of ${fabric.name}`}
          >
            Buy · {fabricCost(state, fabric, metres)} coins
          </Button>
        </div>
      ) : (
        <p className="ad-shop-card__locked">Unlocks at reputation {fabric.unlockReputation}</p>
      )}
    </li>
  );
}
