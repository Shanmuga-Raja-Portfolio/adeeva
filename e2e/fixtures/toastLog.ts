import type { Page } from "@playwright/test";

export interface ShownToast {
  readonly tone: string;
  readonly text: string;
  readonly visible: boolean;
}

interface ToastWindow {
  shownToasts?: ShownToast[];
}

function watchToasts(): void {
  const host = window as ToastWindow;
  if (host.shownToasts !== undefined) return;
  const shown: ShownToast[] = [];
  host.shownToasts = shown;
  const note = (node: Node) => {
    if (!(node instanceof Element)) return;
    const toasts = node.matches(".ad-toast") ? [node] : Array.from(node.querySelectorAll(".ad-toast"));
    for (const toast of toasts) {
      const tone = /ad-toast--(\w+)/.exec(toast.className)?.[1] ?? "";
      const box = toast.getBoundingClientRect();
      const visible = box.width > 0 && box.height > 0 && toast.checkVisibility({ visibilityProperty: true });
      shown.push({ tone, text: toast.textContent?.trim() ?? "", visible });
    }
  };
  new MutationObserver((records) => {
    for (const record of records) record.addedNodes.forEach(note);
  }).observe(document, { subtree: true, childList: true });
}

export type ToastLog = () => Promise<readonly ShownToast[]>;

export async function recordToasts(page: Page): Promise<ToastLog> {
  await page.addInitScript(watchToasts);
  await page.evaluate(watchToasts);
  return () => page.evaluate(() => (window as ToastWindow).shownToasts ?? []);
}

export async function toastsShown(log: ToastLog, text: string, tone?: string): Promise<number> {
  return (await log()).filter(
    (toast) => toast.text.includes(text) && (tone === undefined || toast.tone === tone),
  ).length;
}

export async function toastsSeen(log: ToastLog, text: string, tone?: string): Promise<number> {
  return (await log()).filter(
    (toast) => toast.visible && toast.text.includes(text) && (tone === undefined || toast.tone === tone),
  ).length;
}

export async function toastsShownAfterPaint(
  page: Page,
  log: ToastLog,
  text: string,
  tone?: string,
): Promise<number> {
  await page.evaluate(() => new Promise<void>((done) => requestAnimationFrame(() => setTimeout(done, 0))));
  return toastsShown(log, text, tone);
}
