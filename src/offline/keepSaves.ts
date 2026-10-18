export function keepSavesOnDevice(): void {
  if (!("storage" in navigator)) return;
  const storage = navigator.storage;
  if (typeof storage.persist !== "function" || typeof storage.persisted !== "function") return;
  storage
    .persisted()
    .then((kept) => (kept ? true : storage.persist()))
    .catch(() => undefined);
}
