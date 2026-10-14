import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Meter } from "../../../../../ui/kit/Meter";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { SALON_NAME } from "../../../content/career";
import { canOpenSalon, SALON_ORDERS, SALON_REPUTATION, type GameState } from "../../../core";
import { CometRoomBackdrop } from "../../art/CometRoomBackdrop";

export interface CometRoomCardProps {
  readonly state: GameState;
  readonly onOpenSalon: (event: ClickLike) => void;
}

export const COMET_TEASER_REPUTATION = 20;

export function CometRoomCard({ state, onOpenSalon }: CometRoomCardProps) {
  const later = state.story.flags.includes("salon-later");
  if (state.career !== "bakery" || (!later && state.reputation < COMET_TEASER_REPUTATION)) return null;
  const check = canOpenSalon(state);
  return (
    <Card
      tone="rose"
      eyebrow="Otti's back parlour"
      title={SALON_NAME}
      className="pa-hub-card pa-comet-card"
      data-testid="comet-room-card"
    >
      <CometRoomBackdrop className="pa-comet-card__art" />
      <p className="pa-muted">
        A tea salon with three-tier stands, and a seat at the Larkspur Patisserie Fair every season.
      </p>
      <Meter
        label="Reputation"
        value={Math.min(state.reputation, SALON_REPUTATION)}
        max={SALON_REPUTATION}
        valueText={
          state.reputation >= SALON_REPUTATION ? "Ready!" : `${state.reputation} of ${SALON_REPUTATION}`
        }
      />
      <Meter
        label="Orders delivered"
        tone="sage"
        value={Math.min(state.ordersDelivered, SALON_ORDERS)}
        max={SALON_ORDERS}
        valueText={
          state.ordersDelivered >= SALON_ORDERS ? "Ready!" : `${state.ordersDelivered} of ${SALON_ORDERS}`
        }
      />
      {later ? (
        <Button
          block
          icon="sparkle"
          onClick={onOpenSalon}
          disabledReason={check.ok ? undefined : check.reasons[0]}
          showReason
          data-testid="open-comet-room"
        >
          Open the Comet Room
        </Button>
      ) : null}
    </Card>
  );
}
