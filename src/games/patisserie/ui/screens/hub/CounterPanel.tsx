import { colourById } from "../../../../../engine/palette";
import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { TrayProductId } from "../../../content/product";
import {
  canOpenCounter,
  counterCapacity,
  isCounterDay,
  productById,
  trayStartIssue,
  type GameState,
} from "../../../core";

export interface CounterPanelProps {
  readonly state: GameState;
  readonly onStartTray: (event: ClickLike, productId: TrayProductId) => void;
  readonly onOpenCounter: (event: ClickLike) => void;
}

export function CounterPanel({ state, onStartTray, onOpenCounter }: CounterPanelProps) {
  const { trays, lastSummary } = state.counter;
  const capacity = counterCapacity(state);
  const trayIssue = trayStartIssue(state);
  const open = canOpenCounter(state);
  return (
    <Card
      title="Counter trays"
      eyebrow={`${trays.length} of ${capacity} on the counter`}
      className="pa-hub-card"
    >
      <ul className="pa-trays">
        {Array.from({ length: capacity }, (_, index) => {
          const tray = trays[index];
          return (
            <li key={index} className={tray === undefined ? "pa-tray pa-tray--empty" : "pa-tray"}>
              {tray === undefined ? (
                <span className="pa-muted">Empty spot</span>
              ) : (
                <>
                  <span className="pa-tray__swatch" style={{ background: colourById(tray.colour).hex }} />
                  <span>
                    <strong>{productById(tray.productId).name}</strong>
                    <span className="pa-muted">
                      {" "}
                      · {tray.left} left · quality {tray.quality}
                    </span>
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ul>
      {state.counter.session !== null ? (
        <Button block size="lg" icon="star" onClick={onOpenCounter} data-testid="back-to-counter">
          Back to the counter
        </Button>
      ) : isCounterDay(state.calendar.day) ? (
        <Button
          block
          size="lg"
          icon="star"
          onClick={onOpenCounter}
          disabledReason={open.ok ? undefined : open.reasons[0]}
          showReason
        >
          Open the counter
        </Button>
      ) : (
        <div className="pa-trays__start">
          <Button
            variant="secondary"
            onClick={(event) => onStartTray(event, "cupcake-tray")}
            disabledReason={trayIssue ?? undefined}
          >
            Bake 6 cupcakes
          </Button>
          <Button
            variant="secondary"
            onClick={(event) => onStartTray(event, "iced-biscuits")}
            disabledReason={trayIssue ?? undefined}
          >
            Bake 6 biscuits
          </Button>
        </div>
      )}
      <p className="pa-hint">
        {lastSummary !== null
          ? `Last Counter Day: ${lastSummary.boxes} boxes, +${lastSummary.coins} coins, ${lastSummary.shared} treats shared with the neighbours.`
          : "Trays take 5 hours. Sell them on day 7, Counter Day."}
      </p>
    </Card>
  );
}
