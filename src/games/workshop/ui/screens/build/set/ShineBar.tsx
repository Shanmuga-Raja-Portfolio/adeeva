import { average } from "../../../../../../engine/average";
import { Meter } from "../../../../../../ui/kit/Meter";
import { SET_HINTS } from "../../../../content/hint";
import { designSurfaces, runPieces, sandRecordOf, surfaceSmooth, type CommissionRun } from "../../../../core";

export function ShineBar({ run }: { readonly run: CommissionRun }) {
  const surfaces = designSurfaces(run);
  return (
    <section className="ww-shine ww-paper" aria-label="Shine on each piece" data-testid="shine-bar">
      <h3 className="ww-shine__title">Even shine</h3>
      <p className="ww-hint">{SET_HINTS.evenShine}</p>
      <div className="ww-shine__bars">
        {runPieces(run).map((piece) => {
          const scores = surfaces
            .filter((part) => part.piece === piece.index)
            .map((part) => {
              const record = sandRecordOf(run, part.id);
              return record.renAccuracy ?? surfaceSmooth(record);
            });
          const value = Math.round((scores.length === 0 ? 0 : average(scores)) * 100);
          return (
            <Meter key={piece.index} label={piece.name} tone="gold" value={value} valueText={`${value}%`} />
          );
        })}
      </div>
    </section>
  );
}
