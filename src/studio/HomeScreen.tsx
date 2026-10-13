import { useEffect, useRef, useState } from "react";
import { Avatar } from "../ui/art/avatar/Avatar";
import { Icon } from "../ui/kit/IconSet";
import { GameTile } from "./GameTile";
import { HallBackdrop } from "./HallBackdrop";
import { nextPerk, PERKS, studioReputation, unlockedPerks } from "./perks";
import { PerksPanel } from "./PerksPanel";
import type { GameId } from "./gameModule";
import type { StudioProfile } from "./profile";
import { GAMES, LIVE_GAMES } from "./registry";
import { ReputationCard } from "./ReputationCard";
import { readRawSlots } from "./slotStore";
import { StudioMark } from "./StudioMark";
import { useToast } from "./ToastContext";
import type { ProfileChange } from "./useStudioProfile";
import "./home.css";

export interface HomeScreenProps {
  readonly profile: StudioProfile;
  readonly returnedFrom: GameId | null;
  readonly onProfileChange: (change: ProfileChange) => void;
}

function previousThreshold(reputation: number): number {
  return PERKS.reduce((top, perk) => (perk.threshold <= reputation ? Math.max(top, perk.threshold) : top), 0);
}

export function HomeScreen({ profile, returnedFrom, onProfileChange }: HomeScreenProps) {
  const toast = useToast();
  const [reputation] = useState(() => studioReputation(LIVE_GAMES, readRawSlots));
  const unlocked = unlockedPerks(reputation, profile.perks);
  const fresh = unlocked.filter((id) => !profile.perks.includes(id)).join(" ");
  const announced = useRef("");
  const next = nextPerk(reputation, unlocked);
  const name = profile.name.trim();

  useEffect(() => {
    if (fresh.length === 0 || announced.current === fresh) return;
    announced.current = fresh;
    const freshIds = fresh.split(" ");
    onProfileChange({ perks: unlockedPerks(reputation, [...profile.perks, ...freshIds]) });
    const labels = PERKS.filter((entry) => freshIds.includes(entry.id)).map((perk) => perk.label);
    toast(
      labels.length === 1
        ? `New perk unlocked: ${labels[0]}`
        : `${labels.length} new perks unlocked! Find them under Studio perks.`,
      "success",
    );
  }, [fresh, reputation, profile.perks, onProfileChange, toast]);

  return (
    <main className="st-home ad-screen" data-theme={profile.theme} data-testid="studio-home">
      <section className="st-hall">
        <HallBackdrop className="st-hall__backdrop" />
        <header className="st-bar">
          <StudioMark />
          <span className="st-bar__promise">
            <Icon name="shield" size={18} />
            Offline · No ads · No chat
          </span>
        </header>
        <div className="st-hero">
          <figure className="st-hero__figure">
            <div className="st-hero__halo" aria-hidden="true" />
            <Avatar
              variant="full"
              look={profile.look}
              accessory={profile.accessory}
              mood="delighted"
              className="st-hero__avatar"
              title={name.length > 0 ? `${name}, your maker` : "Your maker"}
            />
            <div className="st-hero__plinth" aria-hidden="true" />
          </figure>
          <div className="st-hero__copy">
            <span className="st-eyebrow">Your studio hall</span>
            <h1 className="st-hero__title" data-testid="studio-greeting">
              {name.length > 0 ? `Welcome back, ${name}` : "Welcome to Maker Studio"}
            </h1>
            <p className="st-hero__lead">
              Six maker careers share one bright workshop. Your avatar and your reputation travel with you
              from bench to bench.
            </p>
            <ReputationCard
              reputation={reputation}
              unlockedCount={unlocked.length}
              totalPerks={PERKS.length}
              next={next}
              previousThreshold={previousThreshold(reputation)}
            />
          </div>
        </div>
      </section>
      <div className="st-home__content">
        <section className="st-games" aria-labelledby="st-games-title">
          <header className="st-section-head">
            <span className="st-eyebrow">Pick a workbench</span>
            <h2 id="st-games-title">Your games</h2>
          </header>
          <div className="st-games__grid">
            {GAMES.map((game, index) => (
              <GameTile key={game.id} game={game} index={index} returning={game.id === returnedFrom} />
            ))}
          </div>
        </section>
        <PerksPanel
          unlocked={unlocked}
          accessory={profile.accessory}
          theme={profile.theme}
          onAccessory={(accessory) => onProfileChange({ accessory })}
          onTheme={(theme) => onProfileChange({ theme })}
        />
      </div>
      <footer className="st-footer">
        <p>Everything stays on this device. No accounts, no ads, no chat and nothing to buy.</p>
        <a className="st-footer__link" href="#/parent" data-testid="parent-link">
          <Icon name="shield" size={18} />
          Parent page
        </a>
      </footer>
    </main>
  );
}
