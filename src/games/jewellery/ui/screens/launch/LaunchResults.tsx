import { useEffect } from "react";
import type { AvatarLook } from "../../../../../engine/avatar";
import { panelVerdict } from "../../../../../engine/panelScore";
import { focusHeading } from "../../../../../studio/focusHeading";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { PanelCard } from "../../../../../ui/kit/PanelCard";
import { useArmedAfter } from "../../../../../ui/kit/useArmedAfter";
import { useCountUp } from "../../../../../ui/kit/useCountUp";
import { LAUNCH_PANELS } from "../../../content/panelMember";
import { awardById, launchThemeById, spotByNumber, type LaunchResult } from "../../../core";
import { LanternGarland, type GarlandLight } from "../../art/LanternGarland";
import { PANEL_LOOKS } from "./panelLooks";

export interface LaunchResultsProps {
  readonly result: LaunchResult;
  readonly storyCorner: readonly { readonly name: string; readonly look: AvatarLook }[];
  readonly garland: readonly GarlandLight[];
  readonly spotOffer: boolean;
  readonly canReplay: boolean;
  readonly popupToday: boolean;
  readonly onMoveSpot: () => void;
  readonly onReplay: () => void;
  readonly onPopup: () => void;
  readonly onExit: () => void;
}

function signed(amount: number): string {
  return amount > 0 ? `+${amount}` : String(amount);
}

export function LaunchResults({
  result,
  storyCorner,
  garland,
  spotOffer,
  canReplay,
  popupToday,
  onMoveSpot,
  onReplay,
  onPopup,
  onExit,
}: LaunchResultsProps) {
  const { reducedMotion } = useSettings();
  const overall = useCountUp(result.overall, 1400, 300, reducedMotion);
  const armed = useArmedAfter(700);
  const award = awardById(result.award);
  const theme = launchThemeById(result.themeId);
  const moved = result.spotAfter !== result.spot;
  useEffect(() => {
    focusHeading("#jb-launch-results-title");
  }, []);
  return (
    <section
      className="jb-launch-results"
      aria-labelledby="jb-launch-results-title"
      data-testid="launch-results"
    >
      <header className="jb-launch-results__hero">
        <svg
          className="jb-launch-results__garland"
          viewBox="0 0 420 120"
          role="img"
          aria-label={`${theme.name}'s lantern: ${award.name}`}
        >
          <rect width={420} height={120} rx={16} fill="#2b2440" />
          <LanternGarland
            lights={garland}
            width={400}
            sag={30}
            size={30}
            x={10}
            y={20}
            highlight={result.themeId}
          />
        </svg>
        <div>
          <span className="ad-eyebrow">
            {theme.name} · {spotByNumber(result.spot).name}
          </span>
          <h1 id="jb-launch-results-title">
            <span
              className="jb-launch-results__award-dot"
              style={{ background: award.colour }}
              aria-hidden="true"
            />
            {award.name}!
          </h1>
          <p className="jb-launch-results__line">{award.line}</p>
          <p className="jb-launch-results__overall">
            <span className="jb-launch-results__number" aria-label={`Overall ${result.overall} out of 100`}>
              {overall}
            </span>
            <span className="jb-muted">/ 100 · {panelVerdict(result.overall)}</span>
          </p>
          {result.latePenalty > 0 ? (
            <p className="jb-muted">A late Launch: the panels counted {result.latePenalty} fewer points.</p>
          ) : null}
          <div className="jb-launch-results__totals" data-testid="launch-totals">
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
            <p className="jb-launch-results__spot">
              <Icon name="sparkle" size={16} /> Next season your line moves up to{" "}
              {spotByNumber(result.spotAfter).name}!
            </p>
          ) : null}
          {spotOffer ? (
            <Button variant="secondary" icon="sparkle" onClick={onMoveSpot} data-testid="move-spot">
              Move to a bigger spot?
            </Button>
          ) : null}
        </div>
      </header>
      <div className="jb-launch-results__panels">
        {result.panels.map((panel, order) => {
          const look = PANEL_LOOKS[panel.id];
          const members =
            panel.id === "story"
              ? storyCorner
              : (LAUNCH_PANELS.find((entry) => entry.id === panel.id)?.members ?? []);
          return (
            <PanelCard
              key={panel.id}
              panel={panel}
              order={order}
              instant={reducedMotion}
              icon={look.icon}
              tone={look.tone}
              blurb={members.map((member) => member.name).join(", ")}
              verdict={panelVerdict(panel.score)}
              note={panel.praise}
            />
          );
        })}
      </div>
      <aside className="jb-launch-notes" aria-label="Launch Notes">
        <h2>Launch Notes</h2>
        <ul>
          {result.panels.map((panel) => (
            <li key={panel.id}>
              <Icon name="heart" size={14} /> <strong>{panel.label}:</strong> {panel.praise}
            </li>
          ))}
          <li className="jb-launch-notes__tip">
            <Icon name="sparkle" size={14} /> {result.tip}
          </li>
        </ul>
      </aside>
      <footer className="jb-launch-board__foot">
        {canReplay ? (
          <Button variant="ghost" onClick={onReplay} data-testid="replay-launch">
            Watch the Launch again
          </Button>
        ) : null}
        {popupToday ? (
          <Button variant="secondary" onClick={onPopup} disabled={!armed} data-testid="results-popup">
            On to the Pop-up Window
          </Button>
        ) : null}
        <Button size="lg" onClick={onExit} disabled={!armed} data-testid="launch-exit">
          Back to the loft
        </Button>
      </footer>
    </section>
  );
}
