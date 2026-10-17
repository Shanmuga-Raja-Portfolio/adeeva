import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { LineNameId } from "../../../content/lineName";
import { canOpenLoft, loftLater, loftRents, type GameState } from "../../../core";
import { LineNamePicker } from "./LineNamePicker";

export interface LoftOfferCardProps {
  readonly state: GameState;
  readonly onOpen: (event: ClickLike, lineNameId: LineNameId) => void;
}

export function LoftOfferCard({ state, onOpen }: LoftOfferCardProps) {
  const [lineNameId, setLineNameId] = useState<LineNameId | null>(null);
  if (!loftLater(state)) return null;
  const check = canOpenLoft(state);
  const rents = loftRents(state.profile.difficulty);
  const reason = check.ok
    ? lineNameId === null
      ? "Pick a name for your line first."
      : undefined
    : check.reasons[0];
  return (
    <Card
      tone="gold"
      eyebrow="Up the spiral stair"
      title="The Lantern Loft"
      className="jb-hub-card"
      data-testid="loft-offer-card"
    >
      <p className="jb-muted">
        Mr. Osei's old music-box workshop is waiting. Design a whole line, light it for a Lookbook and reveal
        it on Lantern Night.
      </p>
      <p className="jb-muted" data-testid="loft-rent-note">
        Bench and loft rent: {rents.loft} coins a week (bench only: {rents.bench}).
      </p>
      <LineNamePicker value={lineNameId} onChange={setLineNameId} />
      <Button
        icon="sparkle"
        onClick={(event) => {
          if (lineNameId !== null) onOpen(event, lineNameId);
        }}
        disabledReason={reason}
        showReason
        data-testid="open-loft"
      >
        Launch my own collection
      </Button>
    </Card>
  );
}
