import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { STALL_PRODUCT_IDS, type StallProductId } from "../../../content/product";
import {
  canOpenMarket,
  isMarketDay,
  productById,
  STALL_BOX_SIZE,
  stallStartIssue,
  type GameState,
} from "../../../core";
import { PiecePreview } from "../../art/PiecePreview";

interface StallPanelProps {
  readonly state: GameState;
  readonly onStartStall: (event: ClickLike, productId: StallProductId) => void;
  readonly onOpenMarket: () => void;
}

export function StallPanel({ state, onStartStall, onOpenMarket }: StallPanelProps) {
  const issue = stallStartIssue(state);
  const market = canOpenMarket(state);
  const shownToday = state.market.shownDay === state.calendar.day;
  return (
    <Card
      title="Stall box"
      eyebrow={`${state.stallBox.length} of ${STALL_BOX_SIZE} pieces for Market Day`}
      className="jb-hub-card"
      data-testid="stall-panel"
    >
      {state.stallBox.length > 0 ? (
        <ul className="jb-stall-box">
          {state.stallBox.map((piece) => (
            <li key={piece.id} className="jb-stall-box__item">
              <PiecePreview source={piece.look} title={productById(piece.look.productId).name} />
              <span className="jb-stall-box__quality">
                <Icon name="star" size={12} /> {piece.quality}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="jb-muted">Make little pieces between orders, then show them on Market Day.</p>
      )}
      <div className="jb-stall-buttons">
        {STALL_PRODUCT_IDS.map((productId) => (
          <Button
            key={productId}
            size="sm"
            variant="secondary"
            onClick={(event) => onStartStall(event, productId)}
            disabledReason={issue ?? undefined}
          >
            {productById(productId).name}
          </Button>
        ))}
      </div>
      <p className="jb-hint">Each stall piece takes about 4 hours.</p>
      {isMarketDay(state, state.calendar.day) ? (
        <Button
          block
          icon="star"
          onClick={onOpenMarket}
          disabledReason={market.ok || shownToday ? undefined : market.reasons[0]}
          showReason
          data-testid="open-market"
        >
          {shownToday ? "See today's Market Day" : "Set out the stall tray"}
        </Button>
      ) : null}
    </Card>
  );
}
