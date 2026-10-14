import { useState } from "react";
import { Button } from "../ui/kit/Button";
import { Dialog } from "../ui/kit/Dialog";
import { Icon } from "../ui/kit/IconSet";
import type { GameModule } from "./gameModule";
import { playtimeLabel, readPlaytime } from "./playtime";
import { GAMES } from "./registry";
import { clearGameSaves, readRawSlots } from "./slotStore";
import "./parent.css";

const PROMISES = [
  "No ads, and no links that lead out of the studio.",
  "No chat and no contact with other players.",
  "No accounts, sign-ins or email addresses.",
  "Nothing leaves this device. The studio makes no network requests.",
  "Nothing to buy. Coins are earned in play and can't be bought.",
  "No random prize boxes or reward wheels.",
  "No scoring of how anyone looks. Clients judge the work, never the maker.",
] as const;

export function ParentPage() {
  const [playtime] = useState(readPlaytime);
  const [saveCounts, setSaveCounts] = useState(() =>
    Object.fromEntries(GAMES.map((game) => [game.id, readRawSlots(game.id).length])),
  );
  const [clearing, setClearing] = useState<GameModule | null>(null);
  const total = GAMES.reduce((sum, game) => sum + (playtime[game.id] ?? 0), 0);

  const confirmClear = () => {
    if (clearing === null) return;
    clearGameSaves(clearing.id);
    setSaveCounts((current) => ({ ...current, [clearing.id]: 0 }));
    setClearing(null);
  };

  return (
    <main className="st-parent ad-screen" data-testid="parent-page">
      <header className="st-parent__head">
        <a className="st-parent__back" href="#/">
          <Icon name="back" size={20} />
          Back to the studio
        </a>
        <span className="st-eyebrow">For parents and carers</span>
        <h1>How Maker Studio looks after your child</h1>
        <p className="st-muted">
          A calm, offline place to make things. Here is what it never does, how long it has been played on
          this device, and how saves work.
        </p>
      </header>

      <section className="st-parent__card st-parent__card--promise" aria-labelledby="st-promise-title">
        <h2 id="st-promise-title">
          <Icon name="shield" size={22} />
          What this studio does not do
        </h2>
        <ul className="st-parent__promises">
          {PROMISES.map((promise) => (
            <li key={promise}>
              <Icon name="check" size={18} />
              {promise}
            </li>
          ))}
        </ul>
      </section>

      <section className="st-parent__card" aria-labelledby="st-time-title">
        <h2 id="st-time-title">
          <Icon name="clock" size={22} />
          Time played on this device
        </h2>
        <p className="st-muted">Time only counts while a game is open and on screen.</p>
        <dl className="st-parent__times">
          {GAMES.map((game) => (
            <div key={game.id} className="st-parent__time" data-testid={`playtime-${game.id}`}>
              <dt>{game.title}</dt>
              <dd>{playtimeLabel(playtime[game.id] ?? 0)}</dd>
            </div>
          ))}
          <div className="st-parent__time st-parent__time--total">
            <dt>All games</dt>
            <dd>{playtimeLabel(total)}</dd>
          </div>
        </dl>
      </section>

      <section className="st-parent__card" aria-labelledby="st-saves-title">
        <h2 id="st-saves-title">
          <Icon name="lock" size={22} />
          How saves work
        </h2>
        <p>
          Each game keeps up to three save slots in this browser&apos;s own storage, and saves by itself as
          your child plays. Saves never leave this device, so another browser or computer will not see them.
        </p>
        <p>
          To delete one save, open the game and choose Delete on its save card. To clear every save for a
          game, use the buttons below. Clearing this site&apos;s data in the browser settings also removes
          everything.
        </p>
        <ul className="st-parent__games">
          {GAMES.map((game) => (
            <li key={game.id}>
              <span>
                <strong>{game.title}</strong>
                {game.parentNote !== undefined ? <span className="st-muted">{game.parentNote}</span> : null}
                <span className="st-muted">
                  {saveCounts[game.id] === 1 ? "1 save" : `${saveCounts[game.id] ?? 0} saves`}
                </span>
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={(saveCounts[game.id] ?? 0) === 0}
                onClick={() => setClearing(game)}
              >
                Clear {game.title} saves
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <Dialog
        open={clearing !== null}
        title="Clear every save?"
        onClose={() => setClearing(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setClearing(null)}>
              Keep them
            </Button>
            <Button onClick={confirmClear}>Clear saves</Button>
          </>
        }
      >
        <p>
          All {clearing?.title} saves on this device will be removed. This can&apos;t be undone. Studio perks
          that are already unlocked stay unlocked.
        </p>
      </Dialog>
    </main>
  );
}
