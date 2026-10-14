import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ShopSignId } from "../../../content/shopSign";
import {
  boutiqueRuleReasons,
  canOpenBoutique,
  UNLOCK_FAIR_SALES,
  UNLOCK_GIGS_DELIVERED,
  UNLOCK_REPUTATION,
  type GameState,
} from "../../../core";
import { BoutiqueBackdrop } from "../../art/BoutiqueBackdrop";
import { SignPicker } from "./SignPicker";

export interface LarkspurCardProps {
  readonly state: GameState;
  readonly onOpen: (signId: ShopSignId) => void;
}

const SHOW_FROM_REPUTATION = 20;

function Progress({
  label,
  value,
  goal,
}: {
  readonly label: string;
  readonly value: number;
  readonly goal: number;
}) {
  const done = value >= goal;
  return (
    <li className={done ? "tf-goal tf-goal--done" : "tf-goal"}>
      <span className="tf-goal__mark" aria-hidden="true">
        {done ? <Icon name="check" size={14} /> : null}
      </span>
      <span className="tf-goal__label">{label}</span>
      <span className="tf-goal__count">
        {Math.min(value, goal)}/{goal}
      </span>
    </li>
  );
}

export function LarkspurCard({ state, onOpen }: LarkspurCardProps) {
  const [picking, setPicking] = useState(false);
  const reasons = boutiqueRuleReasons(state);
  const ready = reasons.length === 0;
  const offerSeen = state.story.seen.includes("tf-boutique-offer");
  if (state.profile.career !== "stall") return null;
  if (!ready && state.reputation < SHOW_FROM_REPUTATION) return null;
  const check = canOpenBoutique(state);
  return (
    <Card
      title="Larkspur Row"
      eyebrow="Your next chapter"
      className="tf-hub-card tf-larkspur"
      data-testid="larkspur-card"
    >
      <div className="tf-larkspur__art">
        <BoutiqueBackdrop signName="Mrs. Pell's" />
      </div>
      <p>
        {ready
          ? "Mrs. Pell's old sewing shop is waiting for you."
          : "One day, a little shop on Larkspur Row could be yours."}
      </p>
      <ul className="tf-goals">
        <Progress label="Reputation" value={state.reputation} goal={UNLOCK_REPUTATION} />
        <Progress label="Orders delivered" value={state.gigsDelivered} goal={UNLOCK_GIGS_DELIVERED} />
        <Progress label="Fair Price sales" value={state.fairSales} goal={UNLOCK_FAIR_SALES} />
      </ul>
      {ready && offerSeen ? (
        <Button
          icon="sparkle"
          onClick={() => setPicking(true)}
          disabledReason={check.ok ? undefined : check.reasons[0]}
          showReason
          data-testid="open-boutique"
        >
          Open the boutique
        </Button>
      ) : null}
      <SignPicker
        open={picking}
        onClose={() => setPicking(false)}
        onPick={(signId) => {
          setPicking(false);
          onOpen(signId);
        }}
      />
    </Card>
  );
}
