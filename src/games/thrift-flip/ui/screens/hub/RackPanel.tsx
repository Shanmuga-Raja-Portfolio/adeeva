import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { ownFlipIssue, rackSize, recipeById, stallDayIssue, type GameState } from "../../../core";
import { pieceCloth } from "../../art/findCloth";
import { LeafMeter } from "../../art/LeafMeter";
import { ProductPreview } from "../../art/ProductPreview";

export interface RackPanelProps {
  readonly state: GameState;
  readonly onStartOwn: (event: ClickLike) => void;
  readonly onContinue: () => void;
}

export function RackPanel({ state, onStartOwn, onContinue }: RackPanelProps) {
  const size = rackSize(state.upgrades);
  const run = state.activeRun;
  const ownOnBench = run !== null && run.stage !== "done" && run.purpose.kind === "own";
  const issue = ownFlipIssue(state);
  return (
    <Card
      title="Your stall rack"
      eyebrow={`${state.rack.length} of ${size} hooks used`}
      className="tf-hub-card tf-rack"
    >
      <ul className="tf-rack__hooks">
        {Array.from({ length: size }, (_, index) => {
          const piece = state.rack[index];
          return (
            <li
              key={index}
              className={piece === undefined ? "tf-rack__hook tf-rack__hook--empty" : "tf-rack__hook"}
            >
              {piece === undefined ? (
                <span className="tf-rack__empty" aria-hidden="true" />
              ) : (
                <>
                  <ProductPreview
                    design={piece.design}
                    cloth={pieceCloth(piece.id, piece.cloth)}
                    finishes={piece.finishes}
                    title={recipeById(piece.recipeId).name}
                    className="tf-rack__art"
                  />
                  <span className="tf-rack__name">{recipeById(piece.recipeId).name}</span>
                  <LeafMeter leaves={piece.leaves} size={14} />
                </>
              )}
            </li>
          );
        })}
      </ul>
      {ownOnBench ? (
        <Button
          variant="secondary"
          onClick={onContinue}
          disabledReason={stallDayIssue(state.calendar.day) ?? undefined}
        >
          Continue your own piece
        </Button>
      ) : (
        <Button
          variant="secondary"
          icon="sparkle"
          onClick={onStartOwn}
          disabledReason={issue ?? undefined}
          data-testid="start-own"
        >
          Make a piece for Stall Day
        </Button>
      )}
    </Card>
  );
}
