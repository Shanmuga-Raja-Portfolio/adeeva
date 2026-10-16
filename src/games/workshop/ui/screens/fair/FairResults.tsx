import { useSettings } from "../../../../../studio/SettingsContext";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { PanelCard } from "../../../../../ui/kit/PanelCard";
import { useArmedAfter } from "../../../../../ui/kit/useArmedAfter";
import { useCountUp } from "../../../../../ui/kit/useCountUp";
import { FAIR_PANELS } from "../../../content/panelMember";
import {
  fairBoothByNumber,
  fairThemeById,
  panelVerdict,
  rosetteById,
  setTemplateById,
  type FairResult,
  type FloorSet,
} from "../../../core";
import { RosetteArt } from "../../art/RosetteArt";
import "../build/results/results.css";
import { PANEL_LOOKS } from "./panelLooks";

export interface FairResultsProps {
  readonly result: FairResult;
  readonly set: FloorSet | null;
  readonly boothOffer: boolean;
  readonly onMoveUp: () => void;
  readonly onReplay: () => void;
  readonly onExit: () => void;
}

function signed(amount: number): string {
  return amount > 0 ? `+${amount}` : String(amount);
}

export function FairResults({ result, set, boothOffer, onMoveUp, onReplay, onExit }: FairResultsProps) {
  const { reducedMotion } = useSettings();
  const overall = useCountUp(result.overall, 1400, 300, reducedMotion);
  const armed = useArmedAfter(700);
  const rosette = rosetteById(result.rosette);
  const theme = fairThemeById(result.themeId);
  const moved = result.boothAfter !== result.booth;
  return (
    <section
      className="ww-fair-results"
      aria-labelledby="ww-fair-results-title"
      data-testid="fair-results-screen"
    >
      <header className="ww-fair-results__hero ww-paper ww-tape">
        <svg className="ww-fair-results__rosette" viewBox="-60 -60 120 150" aria-hidden="true">
          <RosetteArt rosetteId={result.rosette} />
        </svg>
        <div>
          <span className="ad-eyebrow">
            {theme.name} · {fairBoothByNumber(result.booth).name}
            {set === null ? "" : ` · ${setTemplateById(set.templateId).name}`}
          </span>
          <h1 id="ww-fair-results-title">{rosette.name}!</h1>
          <p className="ww-fair-results__line">{rosette.line}</p>
          <p className="ww-fair-results__overall">
            <span className="ww-fair-results__number" aria-label={`Overall ${result.overall} out of 100`}>
              {overall}
            </span>
            <span className="ww-muted">/ 100 · {panelVerdict(result.overall)}</span>
          </p>
          {result.latePenalty > 0 ? (
            <p className="ww-muted">A late booth: the panels counted {result.latePenalty} fewer points.</p>
          ) : null}
          <div className="ww-results__totals" data-testid="fair-totals">
            <span>
              <Icon name="coin" size={18} /> {signed(result.coins)}
            </span>
            <span>
              <Icon name="star" size={18} /> {signed(result.reputation)} rep
            </span>
            <span>
              <Icon name="megaphone" size={18} /> {signed(result.buzz)} buzz
            </span>
          </div>
          {moved ? (
            <p className="ww-fair-results__booth">
              <Icon name="sparkle" size={16} /> Next season you move up to the{" "}
              {fairBoothByNumber(result.boothAfter).name}!
            </p>
          ) : null}
          {boothOffer ? (
            <Button variant="secondary" icon="sparkle" onClick={onMoveUp} data-testid="move-up-booth">
              Move to a bigger booth?
            </Button>
          ) : null}
          {set !== null ? (
            <p className="ww-muted">
              {set.mode === "sale"
                ? `The set is back on the showroom floor, for sale at ${set.price} coins.`
                : "The set is back on the showroom floor, on show."}
            </p>
          ) : null}
        </div>
      </header>
      <div className="ww-fair-results__panels">
        {result.panels.map((panel, order) => {
          const look = PANEL_LOOKS[panel.id];
          const members = FAIR_PANELS.find((entry) => entry.id === panel.id)?.members ?? [];
          return (
            <PanelCard
              key={panel.id}
              panel={panel}
              order={order}
              instant={reducedMotion}
              icon={look.icon}
              tone={look.tone}
              blurb={
                members.length > 0
                  ? members.map((member) => member.name).join(", ")
                  : "Past clients from the road"
              }
              verdict={panelVerdict(panel.score)}
              note={panel.note}
            />
          );
        })}
      </div>
      <aside className="ww-fair-notes ww-paper" aria-label="Fair Notes">
        <h2>Fair Notes</h2>
        <ul>
          {result.panels.map((panel) => (
            <li key={panel.id}>
              <Icon name="heart" size={14} /> <strong>{panel.label}:</strong> {panel.note}
            </li>
          ))}
          <li className="ww-fair-notes__tip">
            <Icon name="sparkle" size={14} /> {result.tip}
          </li>
        </ul>
      </aside>
      <footer className="ww-fair-board__foot">
        <Button variant="ghost" onClick={onReplay}>
          Watch the reveal again
        </Button>
        <Button size="lg" onClick={onExit} disabled={!armed} data-testid="fair-exit">
          Back to the shop
        </Button>
      </footer>
    </section>
  );
}
