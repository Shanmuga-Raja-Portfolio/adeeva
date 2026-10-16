import { useEffect } from "react";
import { focusHeading } from "../../../../../studio/focusHeading";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Button } from "../../../../../ui/kit/Button";
import { Icon, type IconName } from "../../../../../ui/kit/IconSet";
import type { MeterTone } from "../../../../../ui/kit/Meter";
import { PanelCard } from "../../../../../ui/kit/PanelCard";
import { useCountUp } from "../../../../../ui/kit/useCountUp";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { HOME_PANELS, type HomePanelId } from "../../../content/panelMember";
import {
  keyById,
  plotById,
  plotFor,
  verdictFor,
  type Action,
  type GameState,
  type OpenHouseRecord,
} from "../../../core";
import { KeyArt } from "../../art/KeyArt";

interface OpenHouseResultsProps {
  readonly state: GameState;
  readonly record: OpenHouseRecord;
  readonly dispatch: (action: Action) => boolean;
  readonly onReplay: (() => void) | null;
  readonly onExit: () => void;
}

const PANEL_LOOKS: Readonly<Record<HomePanelId, { readonly icon: IconName; readonly tone: MeterTone }>> = {
  flow: { icon: "home", tone: "sage" },
  light: { icon: "sparkle", tone: "gold" },
  comfort: { icon: "heart", tone: "rose" },
  story: { icon: "star", tone: "ink" },
};

function nextStep(state: GameState, record: OpenHouseRecord): string {
  const larkspur = state.larkspur;
  if (larkspur === null) return "";
  if (record.advance === "sister")
    return "Bellwind would love a sister home next door: same plot, new family story.";
  if (larkspur.choicePending)
    return "Ms. Achebe asks: stay for the sister home next door, or move to the next plot?";
  return `Next up: ${plotFor(larkspur).name}.`;
}

export function OpenHouseResults({ state, record, dispatch, onReplay, onExit }: OpenHouseResultsProps) {
  const { reducedMotion } = useSettings();
  const once = useDispatchOnce(state, dispatch);
  const overall = useCountUp(record.overall, 1400, 300, reducedMotion);
  const key = keyById(record.keyId);
  const plot = plotById(record.plotId);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    focusHeading();
  }, []);
  const coins = record.prize.reduce((sum, line) => sum + line.amount, 0);
  return (
    <main className="is-oh-results ad-screen" data-testid="open-house-results">
      <header className="is-oh-results__hero">
        <div className="is-oh-results__key">
          <KeyArt keyId={record.keyId} size={140} />
        </div>
        <div>
          <span className="ad-eyebrow">
            Open House at No. {plot.number} Larkspur Close{record.auto ? " · Bellwind opened the doors" : ""}
          </span>
          <h1>{verdictFor(record.overall)}!</h1>
          <p className="is-oh-results__key-name">
            <strong>{key.name}</strong> · {key.line}
          </p>
        </div>
        <div className="is-oh-results__score" aria-label={`Overall ${record.overall} out of 100`}>
          <span aria-hidden="true">{overall}</span>
          <small>overall</small>
          {record.late ? <small className="is-muted">a day late, so 10 less</small> : null}
        </div>
      </header>
      <section className="is-oh-results__panels" aria-label="What the neighbours said">
        {record.panels.map((panel, index) => {
          const def = HOME_PANELS.find((entry) => entry.id === panel.id);
          const look = PANEL_LOOKS[panel.id];
          return (
            <PanelCard
              key={panel.id}
              panel={panel}
              order={index}
              instant={reducedMotion}
              icon={look.icon}
              tone={look.tone}
              blurb={
                def === undefined
                  ? ""
                  : `${def.club}: ${def.members.map((member) => member.name).join(" and ")}`
              }
              verdict={verdictFor(panel.score)}
              note={record.notes[index]}
            />
          );
        })}
      </section>
      <section className="is-oh-results__bottom">
        <article className="is-oh-results__tip is-tape-card">
          <h2>
            <Icon name="heart" size={18} /> Next time
          </h2>
          <p data-testid="open-house-tip">{record.tip}</p>
          <p className="is-muted">{nextStep(state, record)}</p>
          {state.larkspur?.choicePending === true ? (
            <div className="is-larkspur__choice-buttons">
              <Button
                variant="secondary"
                onClick={(event) => once(event, { type: "chooseNextPlot", move: false })}
              >
                Stay for the sister home
              </Button>
              <Button
                onClick={(event) => once(event, { type: "chooseNextPlot", move: true })}
                data-testid="results-move"
              >
                Move to the next plot
              </Button>
            </div>
          ) : null}
        </article>
        <article className="is-oh-results__prize is-tape-card" data-testid="open-house-prize">
          <h2>
            <Icon name="coin" size={18} /> Bellwind's thank-you
          </h2>
          <ul>
            {record.prize.map((line) => (
              <li key={line.label}>
                <span>{line.label}</span>
                <strong>+{line.amount}</strong>
              </li>
            ))}
          </ul>
          <p className="is-oh-results__totals">
            <span>
              <Icon name="coin" size={16} /> +{coins}
            </span>
            <span>
              <Icon name="star" size={16} />{" "}
              {record.reputation >= 0 ? `+${record.reputation}` : record.reputation} rep
            </span>
            <span>
              <Icon name="megaphone" size={16} /> +{record.buzz} buzz
            </span>
          </p>
        </article>
      </section>
      <footer className="is-oh-results__footer">
        {onReplay === null ? null : (
          <Button variant="secondary" icon="sparkle" onClick={onReplay} data-testid="replay-show">
            Watch it again
          </Button>
        )}
        <Button size="lg" icon="home" onClick={onExit} data-testid="results-exit">
          Back to the loft
        </Button>
      </footer>
    </main>
  );
}
