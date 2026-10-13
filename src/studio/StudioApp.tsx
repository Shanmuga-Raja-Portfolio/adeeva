import { useCallback, useEffect, useMemo } from "react";
import { focusHeading } from "./focusHeading";
import type { StudioPlayer } from "./gameModule";
import { GameStage } from "./GameStage";
import { HomeScreen } from "./HomeScreen";
import { ParentPage } from "./ParentPage";
import { lookOptions } from "./perks";
import { liveGame } from "./registry";
import { SettingsProvider } from "./SettingsContext";
import { HOME_ROUTE } from "./studioRoute";
import { ToastProvider } from "./ToastContext";
import { useStudioProfile } from "./useStudioProfile";
import { useStudioRoute } from "./useStudioRoute";

function StudioShell() {
  const [arrival, navigate] = useStudioRoute();
  const { route, from } = arrival;
  const [profile, updateProfile] = useStudioProfile();
  const player = useMemo(() => ({ name: profile.name, look: profile.look }), [profile.name, profile.look]);
  const options = useMemo(() => lookOptions(profile.perks), [profile.perks]);
  const exitToHome = useCallback(() => navigate(HOME_ROUTE), [navigate]);
  const changePlayer = useCallback(
    (next: StudioPlayer) => updateProfile({ name: next.name, look: next.look }),
    [updateProfile],
  );

  useEffect(() => {
    if (arrival.from === null || arrival.route.name === "game") return;
    if (arrival.route.name === "home" && arrival.from.name === "game") return;
    focusHeading();
  }, [arrival]);

  if (route.name === "parent") return <ParentPage />;
  const game = route.name === "game" ? liveGame(route.gameId) : null;
  if (game !== null)
    return (
      <GameStage
        key={game.id}
        game={game}
        arrived={from !== null}
        player={player}
        lookOptions={options}
        onPlayerChange={changePlayer}
        onExit={exitToHome}
      />
    );
  return (
    <HomeScreen
      profile={profile}
      returnedFrom={from?.name === "game" ? from.gameId : null}
      onProfileChange={updateProfile}
    />
  );
}

export function StudioApp() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <StudioShell />
      </ToastProvider>
    </SettingsProvider>
  );
}
