import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Meter } from "../../../../../ui/kit/Meter";
import { scoreWindow, seasonTheme, signById, type GameState } from "../../../core";
import { WindowScene } from "./WindowScene";

export interface WindowCardProps {
  readonly state: GameState;
  readonly onOpen: () => void;
}

export function WindowCard({ state, onOpen }: WindowCardProps) {
  const boutique = state.boutique;
  if (boutique === null) return null;
  const score = scoreWindow(state, boutique.window);
  const empty = boutique.window.pieces.length + boutique.window.props.length === 0;
  return (
    <Card
      title="The shop window"
      eyebrow="A promise of what's inside"
      className="tf-hub-card tf-window-card"
      data-testid="window-card"
    >
      <WindowScene
        display={boutique.window}
        rack={state.rack}
        season={seasonTheme(state)}
        signName={signById(boutique.signId).name}
        title="Your shop window"
        className="tf-window-card__scene"
      />
      {empty ? (
        <p className="ad-muted">An empty window. Dress it to draw buzz on Till Day.</p>
      ) : (
        <Meter
          label="Window"
          value={score.total}
          valueText={`${score.total} · +${score.buzz} buzz on Till Day`}
          tone="sage"
        />
      )}
      <Button variant="secondary" icon="sparkle" onClick={onOpen} data-testid="open-window">
        {empty ? "Dress the window" : "Rearrange the window"}
      </Button>
    </Card>
  );
}
