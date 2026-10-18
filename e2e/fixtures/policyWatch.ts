import type { BrowserContext, Page } from "@playwright/test";

interface PolicyWindow {
  policyBreaches?: string[];
}

export interface PolicyWatch {
  readonly requests: string[];
  readonly breaches: string[];
  readonly collect: () => Promise<void>;
}

function noteBreaches(): void {
  const host = window as PolicyWindow;
  if (host.policyBreaches !== undefined) return;
  const seen: string[] = [];
  host.policyBreaches = seen;
  document.addEventListener("securitypolicyviolation", (event) => {
    seen.push(`${event.effectiveDirective} blocked ${event.blockedURI || "inline"} in ${event.sourceFile}`);
  });
}

export async function watchPolicy(context: BrowserContext, page: Page): Promise<PolicyWatch> {
  const requests: string[] = [];
  const breaches: string[] = [];
  context.on("request", (request) => requests.push(request.url()));
  page.on("console", (message) => {
    if (/Content Security Policy|Refused to|Permissions-Policy/i.test(message.text()))
      breaches.push(message.text());
  });
  await page.addInitScript(noteBreaches);
  const collect = async () => {
    const seen = await page.evaluate(() => (window as PolicyWindow).policyBreaches ?? []);
    for (const breach of seen) if (!breaches.includes(breach)) breaches.push(breach);
  };
  return { requests, breaches, collect };
}

export function foreignRequests(requests: readonly string[], origin: string): string[] {
  return requests.filter((raw) => {
    const url = new URL(raw);
    return url.protocol !== "data:" && url.protocol !== "blob:" && url.origin !== origin;
  });
}
