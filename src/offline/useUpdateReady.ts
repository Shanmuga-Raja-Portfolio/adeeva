import { useSyncExternalStore } from "react";
import { subscribeToUpdate, updateIsReady } from "./workerUpdates";

export function useUpdateReady(): boolean {
  return useSyncExternalStore(subscribeToUpdate, updateIsReady, () => false);
}
