import { useEffect, useRef } from "react";
import { Icon } from "../ui/kit/IconSet";
import type { StudioGame } from "./gameModule";
import { routeHash } from "./studioRoute";

export interface GameTileProps {
  readonly game: StudioGame;
  readonly index: number;
  readonly returning: boolean;
}

export function GameTile({ game, index, returning }: GameTileProps) {
  const link = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (returning) link.current?.focus();
  }, [returning]);
  const Art = game.tileArt;
  const delay = { animationDelay: `${80 + index * 70}ms` };
  if (game.status === "workshop") {
    return (
      <article
        className="st-tile st-tile--workshop"
        style={delay}
        aria-label={`${game.title}, in the workshop`}
        data-testid={`tile-${game.id}`}
      >
        <div className="st-tile__art">
          <Art className="st-tile__svg" />
          <span className="st-tile__badge">
            <Icon name="needle" size={16} />
            In the workshop
          </span>
        </div>
        <div className="st-tile__body">
          <h3 className="st-tile__title">{game.title}</h3>
          <p className="st-tile__pitch">{game.tagline}</p>
          <span className="st-tile__soon">Coming soon</span>
        </div>
      </article>
    );
  }
  return (
    <a
      ref={link}
      className="st-tile st-tile--live"
      style={delay}
      href={routeHash({ name: "game", gameId: game.id })}
      data-testid={`tile-${game.id}`}
    >
      <div className="st-tile__art">
        <Art className="st-tile__svg" />
        <span className="st-tile__badge st-tile__badge--live">
          <Icon name="sparkle" size={16} />
          Open now
        </span>
      </div>
      <div className="st-tile__body">
        <h3 className="st-tile__title">{game.title}</h3>
        <p className="st-tile__pitch">{game.tagline}</p>
        <span className="st-tile__play">
          Play {game.title}
          <span className="st-tile__arrow" aria-hidden="true">
            →
          </span>
        </span>
      </div>
    </a>
  );
}
