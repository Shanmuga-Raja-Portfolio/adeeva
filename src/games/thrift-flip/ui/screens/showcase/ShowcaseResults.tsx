import { useEffect, useRef } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useCountUp } from "../../../../../ui/kit/useCountUp";
import type { IconName } from "../../../../../ui/kit/IconSet";
import type { MeterTone } from "../../../../../ui/kit/Meter";
import { PanelCard } from "../../../../../ui/kit/PanelCard";
import { ROSETTES } from "../../../content/rosette";
import type { SeasonDef } from "../../../content/season";
import type { ShowPanelId } from "../../../content/showPanel";
import { SHOW_PANELS } from "../../../content/showPanel";
import { recipeById, type Showcase } from "../../../core";
import { pieceCloth } from "../../art/findCloth";
import { ProductPreview } from "../../art/ProductPreview";
import { RosetteArt } from "../../art/RosetteArt";

export interface ShowcaseResultsProps {
  readonly showcase: Showcase;
  readonly season: SeasonDef;
  readonly onReplay: () => void;
  readonly onExit: () => void;
}

const LOOKS: Readonly<
  Record<ShowPanelId, { readonly icon: IconName; readonly tone: MeterTone; readonly blurb: string }>
> = {
  "craft-circle": { icon: "needle", tone: "rose", blurb: "The Larkspur menders' group" },
  "green-thread": { icon: "heart", tone: "sage", blurb: "The repair café volunteers" },
  "story-table": { icon: "star", tone: "gold", blurb: "The library story circle" },
};

function kindVerdict(score: number): string {
  if (score >= 85) return "Over the moon";
  if (score >= 70) return "Delighted";
  if (score >= 55) return "All smiles";
  return "Clapping along";
}

export function ShowcaseResults({ showcase, season, onReplay, onExit }: ShowcaseResultsProps) {
  const { reducedMotion } = useSettings();
  const { result } = showcase;
  const overall = useCountUp(result.overall, 1300, 200, reducedMotion);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);
  const rosette = ROSETTES.find((entry) => entry.id === result.rosette) ?? ROSETTES[ROSETTES.length - 1];
  return (
    <main className="tf-showcase-results ad-screen" data-testid="showcase-results">
      <header className="tf-showcase-results__hero">
        <RosetteArt
          rosette={result.rosette}
          size={150}
          title={rosette?.name ?? "Rosette"}
          className="tf-showcase-results__rosette"
        />
        <div>
          <span className="ad-eyebrow">
            {season.name} · &ldquo;{season.banner}&rdquo;
          </span>
          <h1 ref={headingRef} tabIndex={-1} data-testid="rosette-name">
            {rosette?.name}
          </h1>
          <p className="tf-showcase-results__line">{rosette?.line}</p>
          <p className="tf-showcase-results__overall" aria-label={`Overall ${result.overall} out of 100`}>
            <strong>{overall}</strong> overall
            {result.latePenalty > 0 ? <small> (a late show, −{result.latePenalty})</small> : null}
          </p>
        </div>
      </header>
      <ul className="tf-showcase-results__pieces" aria-label="Pieces in the show">
        {showcase.pieces.map((piece) => (
          <li key={piece.id}>
            <ProductPreview
              design={piece.design}
              cloth={pieceCloth(piece.id, piece.cloth)}
              finishes={piece.finishes}
              title={recipeById(piece.recipeId).name}
              className="tf-showcase-results__piece"
            />
            <span>{recipeById(piece.recipeId).name}</span>
          </li>
        ))}
      </ul>
      <section className="tf-showcase-results__panels" aria-label="The three kind panels">
        {result.panels.map((panel, index) => {
          const def = SHOW_PANELS.find((entry) => entry.id === panel.id);
          return (
            <div key={panel.id} className="tf-panel-wrap">
              <PanelCard
                panel={panel}
                order={index}
                instant={reducedMotion}
                icon={LOOKS[panel.id].icon}
                tone={LOOKS[panel.id].tone}
                blurb={def?.who ?? LOOKS[panel.id].blurb}
                verdict={kindVerdict(panel.score)}
              />
              <p className="tf-panel-wrap__praise">
                <Icon name="heart" size={14} /> {panel.praise}
              </p>
              {panel.tip === null ? null : <p className="tf-panel-wrap__tip">{panel.tip}</p>}
            </div>
          );
        })}
      </section>
      <section className="tf-showcase-results__rewards" aria-label="What the show brought">
        <span>
          <Icon name="bag" size={20} /> {result.requests} capsule{" "}
          {result.requests === 1 ? "request" : "requests"}
        </span>
        <span>
          <Icon name="coin" size={20} /> +{result.coins}
        </span>
        <span>
          <Icon name="star" size={20} /> {result.reputation >= 0 ? "+" : ""}
          {result.reputation}
        </span>
        <span>
          <Icon name="megaphone" size={20} /> +{result.buzz}
        </span>
      </section>
      <p className="ad-muted tf-showcase-results__note">
        Your pieces are back on the rack as Showcase pieces. They sell for a little more this season.
      </p>
      <footer className="tf-showcase-results__foot">
        <Button variant="ghost" onClick={onReplay} data-testid="replay-show">
          Watch the show again
        </Button>
        <Button size="lg" icon="home" onClick={onExit} data-testid="showcase-done">
          Back to the shop
        </Button>
      </footer>
    </main>
  );
}
