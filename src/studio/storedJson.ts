export function readStoredText(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function readStoredJson(key: string): unknown {
  const raw = readStoredText(key);
  return raw === null ? null : parseJson(raw);
}
