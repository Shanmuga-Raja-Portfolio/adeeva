import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { canOpenShowroom, showroomLater, type GameState } from "../../../core";

export interface ShowroomOfferCardProps {
  readonly state: GameState;
  readonly onOpen: (event: ClickLike) => void;
}

export function ShowroomOfferCard({ state, onOpen }: ShowroomOfferCardProps) {
  if (!showroomLater(state)) return null;
  const check = canOpenShowroom(state);
  return (
    <Card tone="gold" eyebrow="Bram's old shop" title="The bicycle shop next door" className="ww-hub-card">
      <p className="ww-muted">
        Bram's spare key is still on the hook. Open a showroom for matched sets, take on an apprentice and
        bring a set to the Larkspur Craft Fair.
      </p>
      <Button
        icon="home"
        onClick={onOpen}
        disabledReason={check.ok ? undefined : check.reasons[0]}
        showReason
        data-testid="open-showroom"
      >
        Open the showroom
      </Button>
    </Card>
  );
}
