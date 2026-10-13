import { useEffect } from "react";
import type { GameId } from "./gameModule";
import { recordPlaytime } from "./playtime";

const FLUSH_INTERVAL_MS = 15_000;

export function usePlaytime(gameId: GameId): void {
  useEffect(() => {
    let since = document.visibilityState === "visible" ? performance.now() : null;
    let carried = 0;

    const collect = () => {
      if (since !== null) {
        const now = performance.now();
        carried += (now - since) / 1000;
        since = now;
      }
      const whole = Math.floor(carried);
      if (whole > 0) {
        recordPlaytime(gameId, whole);
        carried -= whole;
      }
    };

    const onVisibility = () => {
      collect();
      since = document.visibilityState === "visible" ? performance.now() : null;
    };

    const timer = window.setInterval(collect, FLUSH_INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", collect);
    return () => {
      collect();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", collect);
    };
  }, [gameId]);
}
