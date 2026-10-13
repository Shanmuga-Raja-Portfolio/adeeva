import type { ClickLike } from "../../kit/useDispatchOnce";
import { canLaunchLabel, LAUNCH_GIGS_DELIVERED, LAUNCH_REPUTATION, type GameState } from "../../../core";
import { Button } from "../../kit/Button";
import { Card } from "../../kit/Card";
import { Meter } from "../../kit/Meter";

export interface LabelLaunchCardProps {
  state: GameState;
  onLaunch: (event: ClickLike) => void;
}

export function LabelLaunchCard({ state, onLaunch }: LabelLaunchCardProps) {
  const check = canLaunchLabel(state);
  if (check.ok)
    return (
      <Card tone="gold" eyebrow="Your big moment" title="Launch your label" className="ad-hub-card ad-launch">
        <p>
          Your name is getting around. Trade the bedroom studio for an atelier, design a collection and take
          it down the runway.
        </p>
        <Button size="lg" icon="sparkle" onClick={onLaunch}>
          Launch your label
        </Button>
      </Card>
    );
  return (
    <Card eyebrow="Dream goal" title="Road to your own label" className="ad-hub-card">
      <div className="ad-launch__meters">
        <Meter
          label="Reputation"
          value={Math.min(state.reputation, LAUNCH_REPUTATION)}
          max={LAUNCH_REPUTATION}
          valueText={`${state.reputation} / ${LAUNCH_REPUTATION}`}
        />
        <Meter
          label="Gigs delivered"
          tone="sage"
          value={Math.min(state.gigsDelivered, LAUNCH_GIGS_DELIVERED)}
          max={LAUNCH_GIGS_DELIVERED}
          valueText={`${state.gigsDelivered} / ${LAUNCH_GIGS_DELIVERED}`}
        />
      </div>
    </Card>
  );
}
