import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { GameId } from "./gameModule";
import { liveGame } from "./registry";
import { parseRoute, routeHash, type StudioRoute } from "./studioRoute";

export interface StudioArrival {
  readonly route: StudioRoute;
  readonly from: StudioRoute | null;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function currentHash(): string {
  return window.location.hash;
}

function isLive(gameId: GameId): boolean {
  return liveGame(gameId) !== null;
}

function arrivalAt(hash: string, from: StudioRoute | null): StudioArrival {
  return { route: parseRoute(hash, isLive), from };
}

export function useStudioRoute(): readonly [StudioArrival, (route: StudioRoute) => void] {
  const hash = useSyncExternalStore(subscribe, currentHash, () => "");
  const canonical = routeHash(parseRoute(hash, isLive));
  const [arrival, setArrival] = useState(() => arrivalAt(canonical, null));
  if (routeHash(arrival.route) !== canonical) setArrival(arrivalAt(canonical, arrival.route));

  useEffect(() => {
    if (hash !== "" && hash !== canonical) window.location.replace(canonical);
  }, [hash, canonical]);

  const navigate = useCallback((route: StudioRoute) => {
    window.location.hash = routeHash(route);
    window.scrollTo(0, 0);
  }, []);
  return [arrival, navigate];
}
