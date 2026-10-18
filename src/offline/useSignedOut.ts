import { useSyncExternalStore } from "react";
import { signInState, subscribeToSignIn } from "./signInState";

export function useSignedOut(): boolean {
  return useSyncExternalStore(
    subscribeToSignIn,
    () => signInState() === "signed-out",
    () => false,
  );
}
