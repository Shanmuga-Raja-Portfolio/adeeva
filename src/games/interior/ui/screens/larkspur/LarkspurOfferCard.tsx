import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { LarkspurBackdrop } from "../../art/LarkspurBackdrop";
import "./larkspur.css";

interface LarkspurOfferCardProps {
  readonly onTakeKeys: (event: ClickLike) => void;
}

export function LarkspurOfferCard({ onTakeKeys }: LarkspurOfferCardProps) {
  return (
    <Card
      tone="gold"
      eyebrow="Bellwind Homes"
      title="Larkspur Close"
      className="is-hub-card is-larkspur-offer"
      data-testid="larkspur-offer"
    >
      <LarkspurBackdrop className="is-larkspur-offer__street" time="afternoon" />
      <p>
        Ms. Achebe is still holding the keys to six new homes. Whenever you're ready, the street is yours, and
        the loft stays yours too.
      </p>
      <Button icon="home" onClick={onTakeKeys} data-testid="take-keys">
        Take the keys
      </Button>
    </Card>
  );
}
