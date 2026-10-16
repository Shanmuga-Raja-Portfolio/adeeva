import { useEffect, type CSSProperties } from "react";
import { useSettings } from "../../../../../../studio/SettingsContext";
import { Button } from "../../../../../../ui/kit/Button";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { Meter } from "../../../../../../ui/kit/Meter";
import { useArmedAfter } from "../../../../../../ui/kit/useArmedAfter";
import { useCountUp } from "../../../../../../ui/kit/useCountUp";
import { productById, runPieces, setTemplateById, woodById } from "../../../../core";
import { floorLooks } from "../../../art/pieceLook";
import { SetPreview } from "../../../art/SetPreview";
import { ShowroomBackdrop } from "../../../art/ShowroomBackdrop";
import type { StageProps } from "../stageProps";
import "../results/results.css";

export function SetResults({ state, run, onExit }: StageProps) {
  const { reducedMotion } = useSettings();
  const exitArmed = useArmedAfter(700);
  const purpose = run.purpose;
  const set =
    purpose.kind === "set"
      ? (state.showroom?.floor.find((entry) => entry.setId === purpose.setId) ?? null)
      : null;
  const price = useCountUp(set?.price ?? 0, 1400, 600, reducedMotion);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);
  if (set === null) {
    return (
      <div className="ww-results" data-testid="set-results">
        <p className="ww-paper">This set has already gone home with a family. Lovely!</p>
        <Button onClick={onExit}>Back to the shop</Button>
      </div>
    );
  }
  const template = setTemplateById(set.templateId);
  const stats = set.stats;
  const names = runPieces(run).map((piece) => piece.name);
  return (
    <div className={reducedMotion ? "ww-results ww-results--still" : "ww-results"} data-testid="set-results">
      <section className="ww-results__hero">
        <div className="ww-results__scene ww-results__scene--shop">
          <ShowroomBackdrop
            className="ww-results__backdrop"
            decor={state.decor}
            floor={state.showroom?.floor ?? []}
            rail={state.fair?.rosetteRail ?? {}}
          />
          {!reducedMotion ? (
            <div className="ww-results__confetti" aria-hidden="true">
              {Array.from({ length: 18 }, (_, index) => (
                <span key={index} style={{ "--i": index } as CSSProperties} />
              ))}
            </div>
          ) : null}
        </div>
        <div className="ww-results__verdict ww-paper ww-tape">
          <span className="ad-eyebrow">On the showroom floor · {woodById(set.woodId).name}</span>
          <h1>Your {template.name} is on show!</h1>
          <SetPreview looks={floorLooks(set)} title={template.name} className="ww-results__set" />
          <ul className="ww-results__kid">
            {set.pieces.map((piece, index) => (
              <li key={index} className="ww-results__kid-line" style={{ "--reveal": index } as CSSProperties}>
                <strong>{names[index] ?? productById(piece.productId).name}:</strong> quality {piece.quality}
              </li>
            ))}
          </ul>
          <div className="ww-results__score">
            <span className="ww-results__number" aria-label={`Price ${set.price} coins`}>
              {price}
            </span>
            <span className="ww-muted">coins at Open House</span>
          </div>
          <p className="ww-hint">
            <Icon name="home" size={16} /> It stands For sale. Mark it Keep on show in the shop, or bring it
            to the Fair.
          </p>
          <Button size="lg" onClick={onExit} disabled={!exitArmed} data-testid="results-exit">
            Back to the shop
          </Button>
        </div>
      </section>
      <section className="ww-results__details">
        <div className="ww-results__panel ww-paper">
          <h2>How the set hangs together</h2>
          <Meter label="Set quality" tone="gold" value={stats.quality} valueText={String(stats.quality)} />
          <Meter label="Even shine" tone="sage" value={stats.evenness} valueText={String(stats.evenness)} />
          {stats.matchedFaces === null ? null : (
            <Meter
              label="Matched faces"
              tone="ink"
              value={Math.round(stats.matchedFaces * 100)}
              valueText={`${Math.round(stats.matchedFaces * 100)}%`}
            />
          )}
          <Meter
            label="Matching hardware"
            tone="rose"
            value={stats.hardware}
            valueText={String(stats.hardware)}
          />
          <Meter label="Harmony" tone="sage" value={stats.harmony} valueText={String(stats.harmony)} />
        </div>
      </section>
    </div>
  );
}
