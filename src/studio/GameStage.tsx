import { createElement, lazy, useEffect, type ComponentType, type LazyExoticComponent } from "react";
import { focusHeading } from "./focusHeading";
import type { GameId, GameModule, GameScreenProps } from "./gameModule";
import { GAMES } from "./registry";
import { usePlaytime } from "./usePlaytime";
import { ViewLoadBoundary } from "./ViewLoadBoundary";

const SCREENS: ReadonlyMap<GameId, LazyExoticComponent<ComponentType<GameScreenProps>>> = new Map(
  GAMES.map((game) => [game.id, lazy(game.load)]),
);

interface GameScreenFrameProps extends GameScreenProps {
  readonly gameId: GameId;
  readonly arrived: boolean;
}

function GameScreen({ gameId, arrived, ...screenProps }: GameScreenFrameProps) {
  useEffect(() => {
    if (arrived) focusHeading();
  }, [arrived]);
  const Screen = SCREENS.get(gameId);
  if (Screen === undefined) throw new Error(`No screen is registered for ${gameId}`);
  return createElement(Screen, screenProps);
}

export interface GameStageProps extends GameScreenProps {
  readonly game: GameModule;
  readonly arrived: boolean;
}

export function GameStage({ game, arrived, ...screenProps }: GameStageProps) {
  usePlaytime(game.id);
  return (
    <ViewLoadBoundary onLeave={screenProps.onExit}>
      <GameScreen gameId={game.id} arrived={arrived} {...screenProps} />
    </ViewLoadBoundary>
  );
}
