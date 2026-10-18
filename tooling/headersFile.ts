export interface HeaderRule {
  readonly pattern: string;
  readonly headers: readonly (readonly [string, string])[];
}

const HEADER_LINE = /^([A-Za-z0-9-]+):\s*(.*)$/;

export function parseHeadersFile(text: string): HeaderRule[] {
  const rules: { pattern: string; headers: [string, string][] }[] = [];
  text.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trimEnd();
    if (line.trim().length === 0) return;
    if (!/^\s/.test(line)) {
      if (!line.startsWith("/")) throw new Error(`_headers line ${index + 1}: a path must start with /`);
      rules.push({ pattern: line, headers: [] });
      return;
    }
    const current = rules.at(-1);
    const header = HEADER_LINE.exec(line.trim());
    if (current === undefined || header === null)
      throw new Error(`_headers line ${index + 1}: expected "Name: value" under a path`);
    current.headers.push([header[1] ?? "", (header[2] ?? "").trim()]);
  });
  return rules;
}

function escapeForPattern(part: string): string {
  return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function matchesPath(pattern: string, path: string): boolean {
  const source = pattern.split("*").map(escapeForPattern).join(".*");
  return new RegExp(`^${source}$`).test(path);
}

export function headersFor(rules: readonly HeaderRule[], path: string): Record<string, string> {
  const merged = new Map<string, readonly [string, string]>();
  for (const rule of rules) {
    if (!matchesPath(rule.pattern, path)) continue;
    for (const [name, value] of rule.headers) {
      const key = name.toLowerCase();
      const earlier = merged.get(key);
      merged.set(key, earlier === undefined ? [name, value] : [earlier[0], `${earlier[1]}, ${value}`]);
    }
  }
  return Object.fromEntries(merged.values());
}

export function overPlainHttp(headers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).map(([name, value]) => [
      name,
      name.toLowerCase() === "content-security-policy"
        ? value
            .split(";")
            .map((directive) => directive.trim())
            .filter((directive) => directive.length > 0 && directive !== "upgrade-insecure-requests")
            .join("; ")
        : value,
    ]),
  );
}
