import { useEffect } from "react";
import { focusHeading } from "../../../../../studio/focusHeading";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { PanelCard } from "../../../../../ui/kit/PanelCard";
import { useCountUp } from "../../../../../ui/kit/useCountUp";
import { useSettings } from "../../../../../studio/SettingsContext";
import type { FairThemeDef } from "../../../content/fairTheme";
import { fairTentByNumber, panelVerdict, ribbonById, type FairResult } from "../../../core";
import { BakePreview } from "../../art/BakePreview";
import { GlasshouseBackdrop } from "../../art/GlasshouseBackdrop";
import { Rosette } from "../../art/Rosette";
import { PANEL_LOOKS } from "./panelLooks";
import type { ShowPlateView } from "./showPlates";

export interface FairResultsProps {
  readonly theme: FairThemeDef;
  readonly result: FairResult;
  readonly plates: readonly ShowPlateView[];
  readonly tentOffer: boolean;
  readonly onMoveUp: () => void;
  readonly onReplay: () => void;
  readonly onExit: () => void;
}

export function FairResults({
  theme,
  result,
  plates,
  tentOffer,
  onMoveUp,
  onReplay,
  onExit,
}: FairResultsProps) {
  const { reducedMotion } = useSettings();
  const overall = useCountUp(result.overall, 1400, 300, reducedMotion);
  const ribbon = ribbonById(result.ribbon);
  const showpiece = plates[0];
  const moved = result.tentAfter !== result.tent;
  useEffect(() => {
    focusHeading();
  }, []);
  return (
    <section className="pa-fair-results" aria-labelledby="pa-fair-results-title" data-testid="fair-results">
      <div className="pa-fair-results__hero">
        <GlasshouseBackdrop className="pa-fair-results__backdrop" lights={1} />
        <div className="pa-fair-results__ribbon pa-doily">
          <span className="pa-fair-results__rosette">
            <Rosette ribbon={result.ribbon} size={150} title={ribbon.name} />
          </span>
          <div>
            <span className="ad-eyebrow">
              {theme.name} · {fairTentByNumber(result.tent).name}
            </span>
            <h2 id="pa-fair-results-title" data-testid="fair-ribbon">
              {ribbon.name}
            </h2>
            <p className="pa-fair-results__line">“{ribbon.line}”</p>
            <p className="pa-fair-results__overall">
              Overall <strong aria-hidden="true">{overall}</strong>
              <span className="ad-visually-hidden">{result.overall}</span>
              {result.latePenalty > 0 ? (
                <span className="pa-muted"> (a day late: −{result.latePenalty})</span>
              ) : null}
            </p>
          </div>
          {showpiece !== undefined && showpiece.look !== null ? (
            <BakePreview
              look={showpiece.look}
              title="Your showpiece"
              className="pa-fair-results__art"
              plaque={showpiece.plaque}
            />
          ) : null}
        </div>
      </div>
      <div className="pa-fair-results__panels">
        {result.panels.map((panel, order) => {
          const look = PANEL_LOOKS[panel.id];
          return (
            <PanelCard
              key={panel.id}
              panel={panel}
              order={order}
              instant
              icon={look.icon}
              tone={look.tone}
              blurb={look.blurb}
              verdict={panelVerdict(panel.score)}
              note={panel.note}
            />
          );
        })}
      </div>
      <div className="pa-fair-results__notes pa-doily">
        <h3>Fair Notes</h3>
        <p className="pa-fair-results__tip">
          <Icon name="sparkle" size={16} /> {result.tip}
        </p>
        <ul className="pa-fair-results__prize">
          <li>
            <Icon name="coin" size={16} /> +{result.coins} coins
          </li>
          <li>
            <Icon name="star" size={16} />{" "}
            {result.reputation >= 0 ? `+${result.reputation}` : result.reputation} reputation
          </li>
          <li>
            <Icon name="megaphone" size={16} /> +{result.buzz} buzz
          </li>
          {moved ? (
            <li>
              <Icon name="sparkle" size={16} /> Next season: {fairTentByNumber(result.tentAfter).name}!
            </li>
          ) : null}
        </ul>
      </div>
      <footer className="pa-fair__footer">
        <Button variant="ghost" onClick={onReplay} data-testid="replay-showcase">
          Watch the showcase again
        </Button>
        {tentOffer ? (
          <Button variant="secondary" icon="sparkle" onClick={onMoveUp} data-testid="results-move-up">
            Move up a tent?
          </Button>
        ) : null}
        <Button size="lg" icon="home" onClick={onExit} data-testid="fair-done">
          Back to the bakery
        </Button>
      </footer>
    </section>
  );
}
